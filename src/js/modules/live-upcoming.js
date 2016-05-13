var LiveUpcoming = (() => {
   return CoreLibrary.Component.subclass({
      defaultArgs: {},

      htmlTemplateFile: './views/live-upcoming.html',

      constructor ( htmlElement, eventsData, liveEventsData, cmsData ) {
         CoreLibrary.Component.apply(this, [{
            rootElement: htmlElement
         }]);
         var upcoming_events = liveEventsData.events.concat(eventsData.events);
         this.scope.scrollStart = 0;
         this.scope.teamData = cmsData;
         this.scope.events = this.parseUpcomingEvents(upcoming_events);
         this.scope.doscroll = this.scroll;
         this.scope.handleClass = this.handleClass;
         this.scope.navigateToEvent = this.navigateToEvent.bind(this);
      },

      init () {
         this.getScroller();
      },

      getScroller () {
         this.scope.scrollerContainer = document.getElementById('live-upcoming');
         this.scope.scroller = document.getElementById('kw-slider-bottom');
         this.scope.scrollerWidth = 350 * this.scope.events.length;
         this.scope.scrollerParent = this.scope.scroller.parentElement;
         this.scope.scrollerParentWidth = this.scope.scrollerParent.offsetWidth;
         this.scope.itemWidth = this.scope.scroller.children[0].offsetWidth;
         this.scope.maxItems = Math.floor(this.scope.scrollerParentWidth / this.scope.itemWidth);
      },

      handleClass ( dir, end ) {
         this.scrollerContainer.classList.remove('faded-right');
         this.scrollerContainer.classList.remove('faded-left');
         if ( dir === 'right' && end ) {
            this.scrollerContainer.classList.add('faded-right');
         } else if ( dir === 'left' && end ) {
            this.scrollerContainer.classList.add('faded-left');
         }
      },

      scroll ( elem, scope ) {
         var dir = this.getAttribute('data-dir'), translate;
         scope.handleClass(dir);
         if ( dir === 'left' ) {
            scope.scrollStart += scope.itemWidth;
         } else {
            scope.scrollStart -= scope.itemWidth;
         }
         if ( scope.scrollStart >= 0 ) {
            scope.scrollStart = 0;
            scope.handleClass(dir, true);
         }
         if ( (scope.scrollStart * -1) >= (scope.scrollerWidth - scope.itemWidth * (scope.maxItems - 1)) ) {
            scope.scrollStart += scope.itemWidth;
            scope.handleClass(dir, true);
         }
         translate = 'translate3d(' + scope.scrollStart + 'px, 0, 0)';
         scope.scroller.style.transform = translate;
         scope.scroller.style.mozTransform = translate;
         scope.scroller.style.webkitTransform = translate;
      },

      parseUpcomingEvents ( events ) {
         var matchesObj = [],
            maxEvents = events.length,
            dateLocale = CoreLibrary.config.locale.replace(/_/, '-');

         // en-GB uses a 24 hour format, so we use en-US instead
         if ( dateLocale === 'en-GB' ) {
            dateLocale = 'en-US';
         }

         if ( events != null && events.length > 0 ) {
            var i = 0;

            for ( ; i < maxEvents; ++i ) {
               var eventDate = new Date(events[i].event.start);

               var date = eventDate.toLocaleDateString(dateLocale, { month: 'long', day: '2-digit' }).toString(),
                  time = eventDate.toLocaleTimeString(dateLocale, { hour: 'numeric', minute: 'numeric' }).toString();

               if ( events[i].liveData && events[i].liveData.matchClock ) {
                  var minute = events[i].liveData.matchClock.minute < 10 ? '0' + events[i].liveData.matchClock.minute : events[i].liveData.matchClock.minute;
                  var second = events[i].liveData.matchClock.second < 10 ? '0' + events[i].liveData.matchClock.second : events[i].liveData.matchClock.second;
                  time = minute + ':' + second;
               }

               events[i].customStartTime = time;
               events[i].customStartDate = date;

               if ( this.scope.teamData.teams && this.scope.teamData.matches && this.scope.teamData.matches[events[i].event.id] ) {
                  events[i].event.homeFlag = this.scope.teamData.teams[this.scope.teamData.matches[events[i].event.id].home].flag;
                  events[i].event.awayFlag = this.scope.teamData.teams[this.scope.teamData.matches[events[i].event.id].away].flag;
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
