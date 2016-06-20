var LiveUpcoming = (() => {
   return CoreLibrary.Component.subclass({
      defaultArgs: {},

      htmlTemplateFile: './views/live-upcoming.html',

      constructor ( htmlElement, eventsData, cmsData, parentScope ) {
         CoreLibrary.Component.apply(this, [{
            rootElement: htmlElement
         }]);

         this.parentScope = parentScope;
         this.scope.teamData = cmsData;
         this.scope.offline_interval = parentScope.offline_interval;
         this.scope.navigateToEvent = this.navigateToEvent.bind(this);

         this.setData(eventsData);

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
                  time = events[i].liveData.matchClock.period;
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

      setData ( events ) {
         this.scope.events = null;
         this.scope.events = this.parseUpcomingEvents(events);
      },

      setLiveData ( liveData ) {
         this.scope.events.forEach(( event, index ) => {
            if ( liveData && event.event && event.event.id === liveData.eventId ) {
               if ( liveData.open === true ) {
                  var time;
                  event.liveData = null;
                  event.liveData = liveData;
                  if ( event.liveData && event.liveData.matchClock ) {
                     time = event.liveData.matchClock.period;
                  }
                  event.customStartTime = time;
               } else {
                  event.betOffers = null;
                  event = null;
                  this.scope.events.splice(index, 1);
               }
            }
         });
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
