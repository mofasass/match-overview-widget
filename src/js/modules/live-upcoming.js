var LiveUpcoming = (() => {
   return CoreLibrary.Component.subclass({
      defaultArgs: {},

      htmlTemplateFile: './views/live-upcoming.html',

      constructor ( htmlElement, eventsData, liveEventsData, cmsData, parentScope ) {
         CoreLibrary.Component.apply(this, [{
            rootElement: htmlElement
         }]);
         var liveEvents = liveEventsData.events.filter(function ( event ) {
            if ( event.event.type === 'ET_MATCH' ) {
               return event.event.state !== 'NOT_STARTED';
            } else {
               return false;
            }
         });

         var upcoming_events = liveEvents.concat(eventsData.events);
         this.parentScope = parentScope;
         this.scope.teamData = cmsData;
         this.scope.events = this.parseUpcomingEvents(upcoming_events);
         this.scope.offline_interval = parentScope.offline_interval;
         this.scope.navigateToEvent = this.navigateToEvent.bind(this);

         setTimeout(() => {
            this.scope.loaded = true;
         }, 200);

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
                  events[i].event.homeName = events[i].liveData ? this.scope.teamData.teams[this.scope.teamData.matches[events[i].event.id].home].name_abbreviation : events[i].event.homeName;
                  events[i].event.homeLabelCustom = this.scope.teamData.teams[this.scope.teamData.matches[events[i].event.id].home].name_abbreviation;
                  // Away
                  events[i].event.awayFlag = this.scope.teamData.teams[this.scope.teamData.matches[events[i].event.id].away].flag;
                  events[i].event.awayName = events[i].liveData ? this.scope.teamData.teams[this.scope.teamData.matches[events[i].event.id].away].name_abbreviation : events[i].event.awayName;
                  events[i].event.awayLabelCustom = this.scope.teamData.teams[this.scope.teamData.matches[events[i].event.id].away].name_abbreviation;
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
