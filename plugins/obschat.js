/*******************************************************************************
required variable from user config:
   obschat.channel   name of the twitch channel

available variables:
   obschat.iframe.clear
   obschat.iframe.light
   obschat.iframe.dark
*******************************************************************************/
(function() {


   //***************************************************************************
   function update() {

      // get twitch channel from user config
      var channel = obsOverlay.getVar('obschat.channel');


      // no channel
      if(!channel) {
         return;
      }


      // lowercase
      channel = channel.toLowerCase();


      // vars
      obsOverlay.setVar(
         'obschat.iframe.clear',
         '<iframe src="https://www.nightdev.com/hosted/obschat/?style=clear&channel='+channel+'"></iframe>'
      );
      obsOverlay.setVar(
         'obschat.iframe.light',
         '<iframe src="https://www.nightdev.com/hosted/obschat/?style=light&channel='+channel+'"></iframe>'
      );
      obsOverlay.setVar(
         'obschat.iframe.dark',
         '<iframe src="https://www.nightdev.com/hosted/obschat/?style=dark&channel='+channel+'"></iframe>'
      );



   }

   // at start
   update();

   // on schedule
   setInterval(update, 5000);

})();