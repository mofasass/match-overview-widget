var LiveUpcoming = (function () {
   return CoreLibrary.Component.subclass({
      defaultArgs: {},

      htmlTemplateFile: './views/live-upcoming.html',

      constructor: function ( htmlElement, eventsData, liveEventsData, cmsData ) {
         CoreLibrary.Component.apply(this, [{
            rootElement: htmlElement
         }]);
         this.scope.teamData = cmsData;
         this.scope.events = this.parseUpcomingEvents(eventsData.events);
         this.scope.liveEvents = liveEventsData.events;
         this.scope.navigateToEvent = this.navigateToEvent.bind(this);
      },

      init: function () {
      },
      parseUpcomingEvents: function ( events ) {
         var matchesObj = {},
            maxEvents = events.length,
            dateLocale = 'sv-SE';

         if ( events != null && events.length > 0 ) {
            var i = 0;

            for ( ; i < maxEvents; ++i ) {
               var eventDate = new Date(events[i].event.start),
                  date = eventDate.toLocaleDateString(dateLocale, { month: 'short', day: '2-digit' }).toString(),
                  time = eventDate.toLocaleTimeString(dateLocale, { hour: 'numeric', minute: 'numeric' }).toString();
               events[i].customStartTime = time;

               if ( !matchesObj.hasOwnProperty(date) ) {
                  matchesObj[date] = {};
               }

               if ( !matchesObj[date].hasOwnProperty(time) ) {
                  matchesObj[date][time] = [];
               }

               if ( this.scope.teamData.teams && this.scope.teamData.matches ) {
                  events[i].event.homeFlag = this.scope.teamData.teams[this.scope.teamData.matches[events[i].event.id].home].flag;
                  events[i].event.awayFlag = this.scope.teamData.teams[this.scope.teamData.matches[events[i].event.id].away].flag;
               }

               matchesObj[date][time].push(events[i]);
            }
         }

         return matchesObj;
      },
      navigateToEvent: function ( e, data ) {
         if ( data.event.event.openForLiveBetting != null && data.event.event.openForLiveBetting === true ) {
            CoreLibrary.widgetModule.navigateToLiveEvent(data.event.event.id);
         } else {
            CoreLibrary.widgetModule.navigateToEvent(data.event.event.id);
         }
      }
   });
})();
