/*******************************************************************************
required variable from user config:
   twitch.channel   name of the twitch channel

available variables:
   twitch.chatters.count
   twitch.viewers.count
*******************************************************************************/
(function() {


   //***************************************************************************
   function update() {

      // get twitch channel from user config
      var channel = obsOverlay.getVar('twitch.channel');


      // timestamp, trying to stay fresh
      var timestamp = Date.now();


      // no channel
      if(!channel) {
         return;
      }


      // lowercase
      channel = channel.toLowerCase();


      // load twitch streams data
      obsOverlay.fetchUrl(
         'https://api.twitch.tv/kraken/streams/'+channel+'?t='+timestamp,
         function(r) {
            r = JSON.parse(r.target.responseText);
            if(r && r.stream && r.stream.viewers != null) {
               // export var
               obsOverlay.setVar('twitch.viewers.count', r.stream.viewers);
            }
         }
      );


      // load twitch chatters data
      obsOverlay.fetchUrl(
         'http://tmi.twitch.tv/group/user/'+channel+'/chatters?t='+timestamp,
         function(r) {
            r = JSON.parse(r.target.responseText);
            if(r) {
               // export var
               obsOverlay.setVar('twitch.chatters.count', r.chatter_count);
            }
         }
      );
   }

   // at start
   update();

   // on schedule
   setInterval(update, 10000);

})();