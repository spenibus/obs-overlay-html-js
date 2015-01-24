/*******************************************************************************
TODO
   - debug(): create shared queue, render in coordinator


NOTES
   window.localStorage and window.sessionStorage {
      long length;                           // Number of items stored
      string key(long index);                // Name of the key at index
      string getItem(string key);            // Get value of the key
      void setItem(string key, string data); // Add a new key with value data
      void removeItem(string key);           // Remove the item key
      void clear();                          // Clear the storage
   };
*******************************************************************************/


var obsOverlay = {


   //*********************************************************** internal config
   cfg : {
      dir_base         : document.location.href.match(/^(.*\/)/)[1],
      dir_user         : 'user/',
      dir_user_plugins : 'user/plugins/',
      dir_user_styles  : 'user/styles/',

      file_config : 'user/config.html',
   },




   //********************************************************************* debug
   debug : function(str) {

      var debugNode = document.getElementById('debug');

      if(!debugNode) {
         return;
      }

      var node = document.createElement('div');
      node.innerHTML = ''
         +'<span>'+(new Date().toISOString().replace('T',' ').slice(0,-5))+'</span> '
         +'<span>'+str+'</span>';
      debugNode.insertBefore(node, debugNode.firstChild);

      // trim (for memory)
      while(debugNode.childNodes.length > 100) {
         debugNode.removeChild(debugNode.childNodes[debugNode.childNodes.length - 1]);
      }
   },




   //******************************************** fetch node content by selector
   getNode : function(selector) {

      var nodes = document.querySelectorAll(selector);

      if(nodes) {
         var out = [];
         for(var i=0; i<nodes.length; ++i) {
            if(nodes[i]) {
               out.push(nodes[i].innerHTML)
            }
         }
         return out;
      }
   },




   //******************************************* update node content by selector
   setNode : function(selector, str, force) {

      str = String(str);

      var nodes = document.querySelectorAll(selector);
      if(nodes) {
         for(var i=0; i<nodes.length; ++i) {
            if(nodes[i] && (force == true || nodes[i].innerHTML != str)) {
               nodes[i].innerHTML = str;
            }
         }
      }
   },




   //**************************************************** save config to storage
   saveConfig : function(obj) {
      window.localStorage.setItem('config', JSON.stringify(obj));
   },




   //************************************************** load config from storage
   loadConfig : function() {

      var template = {
         vars          : {},
         varsPrev      : {},
         varsList      : {},
         varsTimestamp : {},
      };

      var config = window.localStorage.getItem('config');
      config = config != null ? JSON.parse(config) : template;
      return config;
   },




   //******************************************************** get variable (any)
   get : function(name) {


      // skip if no name
      if(name == null) {
         return null;
      }


      // load config
      var config = obsOverlay.loadConfig();


      // navigate to target
      var bits   = name.split('.');
      var target = config;
      for(var i=0; i<bits.length; ++i) {

         if(target[bits[i]] == null) {
            return null;
         }
         var target = target[bits[i]];
      }
      return target;
   },




   //******************************************************** set variable (any)
   set : function(name, value) {


      // skip if no name
      if(name == null) {
         return;
      }


      // load config
      var config = obsOverlay.loadConfig();


      // navigate to target and assign value
      var bits   = name.split('.');
      var last   = bits.length-1;
      var target = config;
      for(var i=0; i<last; ++i) {
         var target = target[bits[i]] || (target[bits[i]] = {});
      }


      // updated on value change
      if(target[bits[last]] != value) {

         // maintain list of vars timestamp with full branch name as ref
         config.varsTimestamp[name] = Date.now();

         // assign new value
         target[bits[last]] = value;
      }


      // maintain list of vars with full branch name as ref
      config.varsList[name] = target[bits[last]];


      // save config
      obsOverlay.saveConfig(config);
   },




   //***************************************************** get variable (vars.*)
   getVar : function(name) {
      return obsOverlay.get('vars.' + name);
   },




   //***************************************************** set variable (vars.*)
   setVar : function(name, value) {
      obsOverlay.set('vars.' + name, value);
   },




   //**************************************** get variables branch as list (any)
   getList : function(name) {

      // load config
      var config = obsOverlay.loadConfig();


      if(name) {

         var list = {};
         for(var i in config.varsList) {

            if(i.substr(0,name.length) == name) {
               list[i] = config.varsList[i];
            }
         }
         return list;
      }

      else {
         return config.varsList;
      }
   },




   //***************************************************************** fetch url
   fetchUrl: function(url, onload) {

      onload = onload || false;

      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, onload ? true : false);
      xhr.onload = onload ? onload : null;

      // local file
      if(url.substr(0,4) == 'file') {
         xhr.overrideMimeType("text/plain");
      }

      try{
         xhr.send(null);
      }catch(e){}

      return xhr.responseText;
   },




   //******************************************** parse user config and set vars
   configRead : function() {

      var data = obsOverlay.fetchUrl(obsOverlay.cfg.dir_base + obsOverlay.cfg.file_config);
      var doc  = (new DOMParser()).parseFromString(data, "text/html");

      var vars = doc.querySelectorAll('var');
      for(var i=0; i<vars.length; ++i) {
         var name = vars[i].getAttribute ? vars[i].getAttribute('name') : null;
         if(name != null) {
            obsOverlay.setVar(name, vars[i].innerHTML);
         }
      }
   },




   //********************************************************************** core
   // create core vars from config and style
   core : function() {


      // read user config
      obsOverlay.configRead();


      // check styles changes
      var styles = obsOverlay.getVar('core.style');
      for(var styleName in styles) {


         // file path
         var filePath = obsOverlay.cfg.dir_base
            +obsOverlay.cfg.dir_user_styles
            +styleName
            +'.css';


         // read file
         var css = obsOverlay.fetchUrl(filePath) || '0';


         // previous read of same file
         var cssPrev = obsOverlay.get('css.contentPrev.'+styleName);


         // set timestamp if change
         if(css != cssPrev) {
            obsOverlay.set('css.timestamp.'+styleName, Date.now());
         }


         // update comparison
         obsOverlay.set('css.contentPrev.'+styleName, css);
      }
   },




   //*************************************************************** coordinator
   // loads user config then launches core + plugins
   coordinator : function() {
      window.addEventListener('load', function() {


         // hello
         obsOverlay.debug('start');


         // clear local storage
         window.localStorage.clear();


         // core start + schedule
         obsOverlay.debug('starting core');
         obsOverlay.core();
         setInterval(obsOverlay.core, 1000);


         // load plugins
         var plugins = obsOverlay.getVar('core.plugin');
         for(var pluginName in plugins) {

            var enabled = plugins[pluginName] == 1 ? true : false;

            if(!enabled) {
               continue;
            }

            // file path
            var filePath = obsOverlay.cfg.dir_base
               +obsOverlay.cfg.dir_user_plugins
               +pluginName
               +'.js';

            // check if file exists
            if(!obsOverlay.fetchUrl(filePath)) {
               obsOverlay.debug('plugin not found: '+pluginName);
               continue;
            }

            obsOverlay.debug('loading plugin: '+pluginName);

            var plugin  = document.createElement('script');
            plugin.type = 'text/javascript';
            plugin.src  = filePath;
            document.body.appendChild(plugin);
         }


      }, false);
   },




   //*********************************************************************** run
   // run by pages (not coordinator)
   run : function() {
      window.addEventListener('load', function() {

         // ui update start + schedule
         obsOverlay.uiUpdate();
         setInterval(obsOverlay.uiUpdate, 100);

      }, false);
   },




   //***************************************************************** ui update
   uiUpdate : function() {


      // sub routine: css update
      obsOverlay.uiUpdate_css();

      // sub routine: elements update
      obsOverlay.uiUpdate_elements();
   },




   //************************************************ ui update sub routine: css
   uiUpdate_css : function() {


      var styles = obsOverlay.getVar('core.style');
      for(var styleName in styles) {


         // enabled status
         var enabled = styles[styleName] == 1 ? true : false;


         // file path
         var filePath = obsOverlay.cfg.dir_base
            +obsOverlay.cfg.dir_user_styles
            +styleName
            +'.css';


         // check if style is already applied to document
         var node = document.querySelector('link[rel="stylesheet"][data-name="'+styleName+'"]');


         // delete node if present and disabled
         if(node && !enabled) {

            node.parentNode.removeChild(node);
            continue;
         }


         // create node if missing and enabled
         else if(!node && enabled) {

            var node = document.createElement('link');
            node.setAttribute('type',           'text/css');
            node.setAttribute('rel',            'stylesheet');
            node.setAttribute('href',           filePath);
            node.setAttribute('data-name',      styleName);
            node.setAttribute('data-timestamp', '0');
            document.getElementsByTagName("head")[0].appendChild(node);
         }


         // update node if modified
         else if(node) {

            // css timestamp
            var cssTimestamp = obsOverlay.get('css.timestamp.'+styleName);

            // get node timestamp
            var nodeTimestamp = node.getAttribute('data-timestamp');

            // reload if timestamp mismatch
            if(nodeTimestamp != cssTimestamp) {

               node.setAttribute('data-timestamp', cssTimestamp);
               node.href = filePath + '#' + cssTimestamp;
            }
         }
      }
   },




   //******************************************* ui update sub routine: elements
   uiUpdate_elements : function() {


      // elements update (recursive)
      // get nodes with elem vars from page
      var build = function(container, depth, func) {

         // increase depth
         // check max nesting level
         // we limit nesting to avoid infinite recursion (var1 > var2 > var1)
         if(++depth > 99) {
            return;
         }


         // querySelectorAll should return nodes in "depth-first pre-order traversal"
         // incremental looping should therefore not skip nodes in case of subtree modification
         var nodes = container.querySelectorAll('[data-var]');
         var timestampData = obsOverlay.get('varsTimestamp');


         for(var i=0; i<nodes.length; ++i) {

            // get node associated var
            var nodeVar = nodes[i].getAttribute('data-var');

            // get var version
            var nodeTimestamp = nodes[i].getAttribute('data-var-timestamp');

            // get current var version
            var varTimestamp = timestampData['vars.'+nodeVar];

            // update on difference
            if(nodeTimestamp != varTimestamp) {

               // update content
               nodes[i].innerHTML = obsOverlay.getVar(nodeVar);

               // update version
               nodes[i].setAttribute('data-var-timestamp', varTimestamp);

               // since this node has been updated, go build its children
               build(nodes[i], depth, func);
            }
         }
      };


      // run
      build(document, 0, build);
   },


};