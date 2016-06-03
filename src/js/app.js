(() => {

   var EuroOverview = CoreLibrary.Component.subclass({

      defaultArgs: {
         filter: '',
         criterionIds: {
            goldenBoot: 1001868386,
            tournamentWinner: 1001221607
         },
         offline_interval: {
            start: '2016-05-23T17:01:02+02:00',
            end: '2016-05-31T10:11:02+02:00'
         },
         tournamentId: 1,
         cmsUrl: 'https://d1fqgomuxh4f5p.cloudfront.net/tournamentdata/'
      },

      constructor () {
         CoreLibrary.Component.apply(this, arguments);
         this.events = [];
      },

      init () {

         this.handleOnlineIntervals();
         this.handleCustomCss();

         this.mainElement = document.getElementById('main');
         this.scope.is_mobile = this.is_mobile();

         // Get the upcoming events
         var eventsPromise = new Promise(( resolve, reject ) => {
            CoreLibrary.offeringModule.getEventsByFilter('football/euro_2016/all/all/matches/')
               .then(( response ) => {
                  if ( response && response.events && response.events.length ) {
                     resolve(response);
                  } else {
                     this.handleError('eventsPromise');
                  }
               });
         });

         // Get the betoffers
         var betofferPromise = new Promise(( resolve, reject ) => {
            CoreLibrary.offeringModule.getEventsByFilter('football/euro_2016/all/all/competitions/')
               .then(( response ) => {
                  if ( response && response.events && response.events.length ) {
                     resolve(response);
                  } else {
                     this.handleError('betofferPromise');
                  }
               });
         });

         // get cms data
         var cmsDataPromise = new Promise(( resolve, reject ) => {
            CoreLibrary.getData(this.scope.args.cmsUrl + this.scope.args.tournamentId + '/overview/overview.json?' +
               'version=' + (window.CMS_VERSIONS ? window.CMS_VERSIONS.overview : ''))
               .then(( response ) => {
                  resolve(response);
               });
         });

         // get live data or local mock live data
         var liveEventsPromise = new Promise(( resolve, reject ) => {
            if ( CoreLibrary.development === true ) {
               CoreLibrary.getData('fakeLivedata.json')
                  .then(( response ) => {
                     resolve(response);
                  });
            } else {
               CoreLibrary.offeringModule.getLiveEventsByFilter('football/euro_2016/')
                  .then(( response ) => {
                     resolve(response);
                  });
            }
         });

         // When both data fetching promises are resolved, we can create the modules and send them the data
         Promise.all([eventsPromise, liveEventsPromise, betofferPromise, cmsDataPromise])
            .then(( promiseData ) => {
               this.liveUpcoming = new LiveUpcoming('section#live-upcoming', promiseData[0], promiseData[1], promiseData[3], this.scope);
               var resizeTimeout = false;

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
                     this.adjustHeight(true);
                  }, 300);

               });

               this.adjustHeight();

               if ( /Edge/i.test(navigator.userAgent) ) {
                  var body = document.getElementsByTagName('body')[0];
                  body.classList.add('browser-edge');
               }

               // Delayed value to be passed on rv-cloak binder
               setTimeout(() => {
                  this.scope.loaded = true;
               }, 200);
            });
         // .catch(this.handleError);
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

      /**
       * Sorts outcomes
       * @param outcomes
       * @returns {Array.<T>}
       */
      sortOutcomes ( outcomes ) {
         return outcomes.sort(( outcomeA, outcomeB ) => {
            return outcomeA.odds - outcomeB.odds;
         });
      },

      /**
       * Adjusts widget height and enable/disable swipe component if mobile
       */
      adjustHeight ( resizeEvent ) {
         var contentHeight = this.scope.offline_interval === false ? 395 : 148; // required value

         if ( this.scope.is_mobile ) {
            contentHeight = this.scope.offline_interval === false ? 380 : 148;
            if ( !this.scope.swiper ) {
               this.scope.swiper = new CoreLibrary.SwipeComponent(document.getElementById('kw-slider-top'), 'Pan', 30);
            } else {
               this.scope.swiper.attach();
            }
         } else {
            if ( this.scope.swiper ) {
               this.scope.swiper.release();
            }
            if ( resizeEvent ) {
               this.liveUpcoming.scope.onResize();
            }
         }
         CoreLibrary.widgetModule.setWidgetHeight(contentHeight);
      },

      /**
       * Compares start and end dates passed to determine widget visibility
       */
      handleOnlineIntervals () {
         if ( this.scope.args.offline_interval && this.scope.args.offline_interval.hasOwnProperty('start') ) {
            CoreLibrary.widgetModule.enableWidgetTransition(true);
            this.date_now = new Date();
            this.date_start = new Date(this.scope.args.offline_interval.start);
            this.date_end = new Date(this.scope.args.offline_interval.end);
            this.scope.offline_interval = (this.date_now > this.date_start && this.date_now < this.date_end);
         }
      },

      /**
       * Makes Ajax request to retrieve customer css
       * If the request fails sets the default widget style
       */
      handleCustomCss () {
         this.customCssBaseUrl = ( this.scope.args.customCss ? this.scope.args.customCss : '' +
            this.scope.args.cmsUrl + 'euro16/css/{customer}/{offering}/' ) + 'style.css';
         this.scope.customCssUrl = this.customCssBaseUrl.replace(/\{customer}/, CoreLibrary.config.customer).replace(/\{offering}/, CoreLibrary.config.offering);

         fetch(this.scope.customCssUrl)
            .then(( response ) => {
               if ( response.status >= 200 && response.status < 300 ) {
                  this.scope.customCss = this.scope.customCssUrl;
               } else {
                  this.scope.customCss = 'custom/style.local.css';
               }
            })
            .catch(( error ) => {
               this.scope.customCss = 'custom/style.local.css';
               console.debug('Error fetching css');
            });
      },

      /**
       * Removes the widget
       * @param prm
       */
      handleError ( prm ) {
         console.warn('Cannot load ', prm, ', removing widget');
         // CoreLibrary.widgetModule.removeWidget();
      },

      /**
       * Check parent element width and return true if is under certain mobile value
       * @returns {boolean}
       */
      is_mobile () {
         return this.mainElement.offsetWidth < 768;
      }

   });

   var euroOverview = new EuroOverview({
      rootElement: 'html'
   });

})();
