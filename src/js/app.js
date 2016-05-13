( () => {

   var EuroOverview = CoreLibrary.Component.subclass({

      defaultArgs: {
         filter: '',
         criterionIds: {
            goldenBoot: 1001868386,
            tournamentWinner: 1001221607
         },
         cmsData: {
            tournamentId: 93,
            // url: 'http://kambi-cdn.globalmouth.com/tournamentdata/'
            url: 'https://s3-eu-west-1.amazonaws.com/kambi-widgets/tournamentdata/'
         }
      },

      constructor () {
         CoreLibrary.Component.apply(this, arguments);
         this.events = [];
      },

      init () {

         this.mainElement = document.getElementById('main');
         this.scope.is_mobile = this.is_mobile();

         // Get the upcoming events
         var eventsPromise = new Promise(( resolve, reject ) => {
            CoreLibrary.offeringModule.getEventsByFilter('football/euro_2016/all/all/matches/')
               .then(( response ) => {
                  resolve(response);
               });
         });

         // Get the betoffers
         var betofferPromise = new Promise(( resolve, reject ) => {
            CoreLibrary.offeringModule.getEventsByFilter('football/euro_2016/all/all/competitions/')
               .then(( response ) => {
                  resolve(response);
               });
         });

         var cmsDataPromoise = new Promise(( resolve, reject ) => {
            CoreLibrary.getData(this.scope.args.cmsData.url + this.scope.args.cmsData.tournamentId + '/overview/overview.json')
               .then(( response ) => {
                  resolve(response);
               });
         });

         var liveEventsPromise = new Promise(( resolve, reject ) => {
            CoreLibrary.offeringModule.getLiveEventsByFilter('football/euro_2016/all/')
               .then(( response ) => {
                  resolve(response);
               });
         });

         // When both data fetching promises are resolved, we can create the modules and send them the data
         Promise.all([eventsPromise, liveEventsPromise, betofferPromise, cmsDataPromoise])
            .then(( promiseData ) => {
               var liveUpcoming = new LiveUpcoming('section#live-upcoming', promiseData[0], promiseData[1], promiseData[3]),
                  resizeTimeout = false;

               var filteredEvents = this.filterOutBetOffers(promiseData[2].events);

               if ( filteredEvents.goldenBoot[0] != null ) {
                  var goldenBoot = new GoldenBoot('div#golden-boot', filteredEvents.goldenBoot[0], promiseData[3]);
               }

               if ( filteredEvents.tournamentWinner[0] != null ) {
                  var tournamentWinner = new TournamentWinner('div#tournament-winner', filteredEvents.tournamentWinner[0], promiseData[3].teams);
               }

               window.addEventListener('resize', () => {
                  clearTimeout(resizeTimeout);

                  resizeTimeout = setTimeout(() => {
                     this.scope.is_mobile = this.is_mobile();
                     this.adjustHeight(this.scope.is_mobile);
                  }, 300);

               });

               this.adjustHeight(this.scope.is_mobile);
            });

      },

      /**
       * Goes through an array of events filters out the events with betoffers that can be mapped based on their criterion id
       * @param {Array} events An array of event objects containing events and betOffers
       * @returns {{groups: Array, goldenBoot: Array, tournamentWinner: Array}}
       */
      filterOutBetOffers ( events ) {
         // Map the criterion
         var mappings = {};
         mappings[this.scope.args.criterionIds.goldenBoot] = 'goldenBoot';
         mappings[this.scope.args.criterionIds.tournamentWinner] = 'tournamentWinner';

         // The return object
         var ret = {
            goldenBoot: [],
            tournamentWinner: []
         };

         // Iterate over the events array
         var i = 0, len = events.length;
         for ( ; i < len; ++i ) {
            // Check if the event has one and only one betOffer
            if ( events[i].betOffers != null && events[i].betOffers.length === 1 ) {
               // Check if the criterion id is one we've mapped
               if ( mappings.hasOwnProperty(events[i].betOffers[0].criterion.id) ) {
                  // If it is, add it to the return object
                  this.sortOutcomes(events[i].betOffers[0].outcomes);
                  ret[mappings[events[i].betOffers[0].criterion.id]].push(events[i]);
               }
            }
         }

         return ret;
      },

      sortOutcomes ( outcomes ) {
         return outcomes.sort( ( outcomeA, outcomeB ) => {
            return outcomeA.odds - outcomeB.odds;
         });
      },

      adjustHeight () {
         var contentHeight = 380;
         CoreLibrary.widgetModule.setWidgetHeight(contentHeight);
         if ( this.scope.is_mobile ) {
            if (!this.scope.swiper) {
               this.scope.swiper = new CoreLibrary.SwipeComponent(document.getElementById('kw-slider-top'), 'Pan', 30);
            }

         }

         if ( this.scope.is_mobile === false && this.scope.swiper ) {
            this.scope.swiper.release();
         } else if ( this.scope.is_mobile && this.scope.swiper ) {
            this.scope.swiper.attach();
         }
      },

      is_mobile () {
         return this.mainElement.offsetWidth < 569;
      }

   });

   var euroOverview = new EuroOverview({
      rootElement: 'html'
   });

})();
