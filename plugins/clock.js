/*******************************************************************************
available variables:
   clock.date           yyyy-mm-dd
   clock.time           hh:mm:ss
   clock.zone           +zzzz
   clock.dateTime       yyyy-mm-dd hh:mm:ss
   clock.dateTimeZone   yyyy-mm-dd hh:mm:ss +zzzz
*******************************************************************************/
(function() {


   //***************************************************************************
   function update() {

      var date = new Date();

      var dateStr =
         date.getFullYear()+'-'+
         ('00'+(date.getMonth()+1)).slice(-2)+'-'+
         ('00'+date.getDate()).slice(-2);

      var timeStr =
         ('00'+date.getHours()).slice(-2)+':'+
         ('00'+date.getMinutes()).slice(-2)+':'+
         ('00'+date.getSeconds()).slice(-2);

      var zoneStr = date.getTimezoneOffset();
      zoneStr = (zoneStr < 0 ? '+' : '-')+('0'+(Math.abs(zoneStr/60)*100 + zoneStr%60)).slice(-4);


      // export vars
      obsOverlay.setVar('clock.date',         dateStr);
      obsOverlay.setVar('clock.time',         timeStr);
      obsOverlay.setVar('clock.zone',         zoneStr);
      obsOverlay.setVar('clock.dateTime',     dateStr+' '+timeStr);
      obsOverlay.setVar('clock.dateTimeZone', dateStr+' '+timeStr+' '+zoneStr);
   }

   // at start
   update();

   // on schedule
   setInterval(update, 100);

})();