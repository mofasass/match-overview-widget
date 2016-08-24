String.prototype.capitalize = function () {
   return this.charAt(0).toUpperCase() + this.slice(1);
};

var MatchesSchedule = (() => {
   return CoreLibrary.Component.subclass({
      defaultArgs: {},

      htmlTemplate: 'live-upcoming-view',

      constructor ( htmlElement, eventsData, data, parentScope ) {
         CoreLibrary.Component.apply(this, [{
            rootElement: htmlElement
         }]);

         this.parentScope = parentScope;
         this.scope.navigateToEvent = this.navigateToEvent.bind(this);

         this.setData(eventsData);

         setTimeout(() => {
            this.scope.loaded = true;
         }, 200);

         this.scope.labels = {
            live: 'Live',
            rightNow: 'Right Now'
         };

         if ( parentScope.is_mobile ) {
            setTimeout(() => {
               this.scope.scroller.scrollPastLogo();
            }, 3000);
         }
      },

      init () {
         this.scope.scroller = new CoreLibrary.ScrollComponent(this.parentScope);
         this.scope.doscroll = this.scope.scroller.onScroll;
         this.scope.onResize = this.scope.scroller.onResize;
         if ( this.parentScope.args.combineFilters === true && this.parentScope.appliedFilters.length > 1) {
            this.scope.logoName = 'combined-filters';
         } else {
            this.scope.logoName = this.parentScope.appliedFilters[0].substring(1).replace(/\//g, '-');
         }
         document.getElementById('kw-scroller-logo').classList.add(this.scope.logoName);

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
               var translate = CoreLibrary.translationModule.getTranslation.bind(CoreLibrary.translationModule),
                  start = new Date(events[i].event.start);
               events[i].customStartTime =
                  translate((new Date().getDate() === start.getDate() ? 'today' :
                     (new Date().getDate() === start.getDate() - 1 ? 'tomorrow' : ''))) + ' ' +
                  pad(start.getDate()) + ' ' +
                  translate('month' + start.getMonth()).slice(0, 3).capitalize() + ' ' +
                  pad(start.getHours()) + ':' +
                  pad(start.getMinutes());

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
                  time = event.liveData && event.liveData.matchClock ? '' : time;
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
         if ( data && data.event && data.event.event.openForLiveBetting != null && data.event.event.openForLiveBetting === true ) {
            CoreLibrary.widgetModule.navigateToLiveEvent(data.event.event.id);
         } else {
            CoreLibrary.widgetModule.navigateToEvent(data.event.event.id);
         }
      }
   });
})();
