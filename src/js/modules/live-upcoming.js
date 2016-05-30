var LiveUpcoming = (() => {
   return CoreLibrary.Component.subclass({
      defaultArgs: {},

      htmlTemplateFile: './views/live-upcoming.html',

      constructor ( htmlElement, eventsData, liveEventsData, cmsData, parentScope ) {
         CoreLibrary.Component.apply(this, [{
            rootElement: htmlElement
         }]);

         this.parentScope = parentScope;
         var upcoming_events = liveEventsData.events.concat(eventsData.events);
         this.scope.teamData = cmsData;
         this.scope.events = this.parseUpcomingEvents(upcoming_events);
         this.scope.offline_interval = parentScope.offline_interval;
         this.scope.navigateToEvent = this.navigateToEvent.bind(this);

         this.scope.labels = {
            live: 'Live',
            rightNow: 'Right Now'
         };
      },

      init () {
         this.scope.scroller = new CoreLibrary.ScrollComponent(this.parentScope);
         this.scope.doscroll = this.scope.scroller.onScroll;
         this.scope.onResize = this.scope.scroller.onResize;
      },

      parseUpcomingEvents ( events ) {
         var matchesObj = [],
            maxEvents = events.length,
            dateLocale = CoreLibrary.config.locale.replace(/_/, '-');

         function pad ( n ) {
            return n < 10 ? '0' + n : n;
         }

         // en-GB uses a 24 hour format, so we use en-US instead
         if ( dateLocale === 'en-GB' ) {
            dateLocale = 'en-US';
         }

         if ( events != null && events.length > 0 ) {
            var i = 0;

            for ( ; i < maxEvents; ++i ) {
               var eventDate = new Date(events[i].event.start);

               var date = eventDate.toLocaleDateString(dateLocale, { month: 'short', day: '2-digit' }),
                  time = pad(eventDate.getHours()) + ':' + pad(eventDate.getMinutes());

               if ( events[i].liveData && events[i].liveData.matchClock ) {
                  var minute = pad(events[i].liveData.matchClock.minute);
                  var second = pad(events[i].liveData.matchClock.second);
                  time = minute + ':' + second;
               }

               events[i].customStartTime = time;
               events[i].customStartDate = date.replace(eventDate.getFullYear(), '');

               if ( this.scope.teamData.teams && this.scope.teamData.matches && this.scope.teamData.matches[events[i].event.id] ) {
                  // Home
                  events[i].event.homeFlag = this.scope.teamData.teams[this.scope.teamData.matches[events[i].event.id].home].flag;
                  events[i].event.home_name_abrev = events[i].liveData ? this.scope.teamData.teams[this.scope.teamData.matches[events[i].event.id].home].name_abbreviation : false;
                  // Away
                  events[i].event.awayFlag = this.scope.teamData.teams[this.scope.teamData.matches[events[i].event.id].away].flag;
                  events[i].event.away_name_abrev = events[i].liveData ? this.scope.teamData.teams[this.scope.teamData.matches[events[i].event.id].away].name_abbreviation : false;
               }
               matchesObj.push(events[i]);
            }
         }

         return matchesObj;
      },

      navigateToEvent ( e, data ) {
         if ( data.event.event.openForLiveBetting != null && data.event.event.openForLiveBetting === true ) {
            CoreLibrary.widgetModule.navigateToLiveEvent(data.event.event.id);
         } else {
            CoreLibrary.widgetModule.navigateToEvent(data.event.event.id);
         }
      }
   });
})();
