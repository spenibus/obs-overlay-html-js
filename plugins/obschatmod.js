/*******************************************************************************
This plugin extend NightDev's OBS Chat.


modifications:
   time display
   compact style
   zebra highlighting (even/odd rows)


required variable from user config:
   obschatmod.cfg.channel      name of the twitch channel
   obschatmod.cfg.compact      enable compact style
                               "1" to enable
   obschatmod.cfg.zebra        enable zebra highlighting
                               "1" to enable
   obschatmod.cfg.timeFormat   time format to use
                               "d" for date as "2015-12-31"
                               "t" for time as "23:59:59"
                               "z" for timezone as "+1200"
                               example: "d t" = "2015-12-31 23:59:59"
   obschatmod.cfg.style        style to use
                               "clear", "light", "dark"


available variables:
   obschatmod.iframe
*******************************************************************************/
obschatmod = {


   //***************************************************************************
   baseUrl : 'https://www.nightdev.com/hosted/obschat/',




   //***************************************************************************
   chatWindow   : null,




   //***************************************************************************
   vars : {},




   //***************************************************************************
   update : function() {


      var varsUser = obsOverlay.getVar('obschatmod.cfg');


      // no channel
      if(!varsUser.channel) {
         return;
      }


      // lowercase
      varsUser.channel = varsUser.channel.toLowerCase();


      // init
      var refresh = false;


      // check for vars change
      for(var i in varsUser) {
         if(varsUser[i] != obschatmod.vars[i]) {
            refresh = true;
         }
      }


      // save new vars
      obschatmod.vars = varsUser;


      // on refresh (init or config update)
      if(refresh) {


         // get chat document source
         var html = obsOverlay.fetchUrl(obschatmod.baseUrl);


         // make doc from source
         var parser = new DOMParser();
         var doc    = parser.parseFromString(html, "text/html");


         // delete load
         doc.head.innerHTML = doc.head.innerHTML.replace(/Chat\.load\(.*\n/i, '\n');


         // complete url of relative scripts (because the location is a data string)
         var scriptNodes = doc.querySelectorAll('script');
         for(var i=0; i<scriptNodes.length; ++i) {

            var src = scriptNodes[i].getAttribute('src');

            if(!src) {
               continue;
            }

            // catching relative protocol
            if(src.substr(0,2) == '//') {
               scriptNodes[i].src = 'https:' + src;
            }

            // catching root path
            else if(src.substr(0,1) == '/') {
               scriptNodes[i].src = obschatmod.baseUrlDomain + src;
            }

            // catching no protocol, assume relative path
            else if(!src.match(/:\/\//)) {
               scriptNodes[i].src = obschatmod.baseUrl + src;
            }
         }


         // add protocol to css images (because the location is a data string)
         var styleNodes = doc.querySelectorAll('style');
         for(var i=0; i<styleNodes.length; ++i) {
            styleNodes[i].innerHTML = styleNodes[i].innerHTML.replace(/url\(\/\//gi, 'url(http://');
         }


         // extend function to integrate in source
         var extend = function() {

            // monitor chat box modification
            document.getElementById('chat_box').addEventListener(
               'DOMNodeInserted',
               function(e){

                  // track zebra status globally
                  window.chatZebraEven = !window.chatZebraEven;

                  var node = e.target;

                  if(node.className != 'chat_line') {
                     return;
                  }

                  // add visible time
                  var timeStr = (function(t){

                     t = new Date(parseInt(t));

                     var tz = t.getTimezoneOffset();
                     var tz = (tz < 0 ? '+' : '-')+('0'+(Math.abs(tz/60)*100 + tz%60)).slice(-4);

                     var strD =
                        t.getFullYear()
                        +'-'+('00'+(t.getMonth()+1)).slice(-2)
                        +'-'+('00'+t.getDate()).slice(-2);

                     var strT = ('00'+t.getHours()).slice(-2)
                        +':'+('00'+t.getMinutes()).slice(-2)
                        +':'+('00'+t.getSeconds()).slice(-2)

                     var strZ = tz;

                     var str = obschatmod.vars.timeFormat
                        .replace(/d/, strD)
                        .replace(/t/, strT)
                        .replace(/z/, strZ);

                     return str;
                  })(node.getAttribute('data-timestamp'));


                  // build time node
                  var timeNode  = document.createElement('span');
                  timeNode.classList.add('time');
                  timeNode.innerHTML = timeStr;

                  // get message node
                  var msgNode = node.querySelector('.message');

                  // remove msg node from line
                  node.removeChild(msgNode);

                  // get remaining nodes from line
                  var otherNodes = node.querySelectorAll('span');

                  // create header node
                  var headerNode = document.createElement('div');
                  headerNode.classList.add('header');

                  // add other nodes to header
                  for(var i=0; i<otherNodes.length; ++i) {
                     headerNode.appendChild(otherNodes[i]);
                  }

                  // add space
                  headerNode.innerHTML += ' ';

                  // add time display
                  headerNode.appendChild(timeNode);

                  // delete line content
                  node.innerHTML = '';

                  // insert header and message
                  node.appendChild(headerNode);
                  node.appendChild(msgNode);

                  // add zebra highlighting
                  if(obschatmod.vars.zebra == '1') {
                     node.classList.add(window.chatZebraEven ? 'zebraEven' : 'zebraOdd');
                  }
               },
               false
            );
         };


         // add some style
         doc.body.innerHTML += ''
            +'<style type="text/css">'
               +'.chat_line .header {text-align:right;}'
               +'.chat_line .header .time {font-size:90%; opacity:0.5;}'
               +'.chat_line.zebraEven {}'
               +'.chat_line.zebraOdd {background-color:rgba(0,0,0,0.2);}'
            +'</style>'



         // add compact style
         if(obschatmod.vars.compact == '1') {
            doc.body.innerHTML += ''
               +'<style type="text/css">'
                  +'html, body {margin:0; padding:0;}'
                  +'#chat_box {width:100%; font-size:1.5vh; line-height:1.5vh;}'
                  +'.chat_line {margin:0; padding:0vh 0.5vh 0vh 0.5vh;}'
               +'</style>'
         }


         // add some code
         doc.body.innerHTML += ''
            +'<script type="text/javascript">'

               // add vars to source
               +'var obschatmod = {vars : '+JSON.stringify(obschatmod.vars)+'};'

               // add extend to source
               +'var extend='+extend.toString()+';'

               // run extend
               +'extend();'

               // run chat
               +'$(document).ready(function(){'
                  +'Chat.vars.style = "'+obschatmod.vars.style+'" || "clear";'
                  +'Chat.load("'+obschatmod.vars.channel+'" || "night");'
               +'});'
            +'</script>';


         // turn source into string
         var docSrc       = '<!DOCTYPE html><html>'+doc.documentElement.innerHTML+'</html>';
         var docSrcData64 = 'data:text/html;base64,'+window.btoa(docSrc);


         // get inline style
         var dataStyle = doc.getElementsByTagName('style')[0].outerHTML;


         // vars
         // we use data-update so the var content is updated even if base64 doesn't change
         obsOverlay.setVar(
            'obschatmod.iframe',
            '<iframe data-update="'+Date.now()+'" src="'+docSrcData64+'"></iframe>'
         );
      }
   },


};


// at start
obschatmod.update();

// on schedule
setInterval(obschatmod.update, 1000);