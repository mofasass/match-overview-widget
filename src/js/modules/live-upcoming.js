var LiveUpcoming = (function () {
   return CoreLibrary.Component.subclass({
      defaultArgs: {},

      htmlTemplateFile: './views/live-upcoming.html',

      constructor: function ( htmlElement, eventsData ) {
         CoreLibrary.Component.apply(this, [{
            rootElement: htmlElement
         }]);
         this.scope.events = this.parseUpcomingEvents(eventsData.events);
      },

      init: function () {
         console.debug('Liveupcoming init');
      },
      parseUpcomingEvents: function ( events ) {
         var matchesObj = {};

         var dateLocale = 'sv-SE'

         if ( events != null && events.length > 0 ) {
            var i = 0, eventsLen = events.length;

            for ( ; i < eventsLen; ++i ) {
               var eventDate = new Date(events[i].event.start);
               var date = eventDate.toLocaleDateString(dateLocale, { month: '2-digit', day: '2-digit' }).toString(),
                  time = eventDate.toLocaleTimeString(dateLocale, { hour: 'numeric', minute: 'numeric' }).toString();
               events[i].customStartTime = time;
               if ( !matchesObj.hasOwnProperty(date) ) {
                  matchesObj[date] = {};
               }

               if ( !matchesObj[date].hasOwnProperty(time) ) {
                  matchesObj[date][time] = [];
               }

               matchesObj[date][time].push(events[i]);
            }
         }

         return matchesObj;
      }
   });
})();