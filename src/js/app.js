(() => {

   var EuroOverview = CoreLibrary.Component.subclass({

      defaultArgs: {
         filter: '',
         criterionIds: {
            goldenBoot: 1001868386,
            tournamentWinner: 1001221607
         },
         pollingInterval: 30000,
         pollingCount: 4,
         tournamentId: 1,
         cmsUrl: 'https://d1fqgomuxh4f5p.cloudfront.net/tournamentdata/',
         widgetTrackingName: 'gm-euro-2016-overview'
      },

      constructor () {
         CoreLibrary.Component.apply(this, arguments);
         this.events = [];
      },

      init () {
         CoreLibrary.setWidgetTrackingName(this.scope.args.widgetTrackingName);

         CoreLibrary.widgetModule.enableWidgetTransition(true);

         this.scope.offline_interval = true;

         this.handleCustomCss();

         this.mainElement = document.getElementById('main');
         this.scope.is_mobile = this.is_mobile();

         // Get the upcoming events
         this.eventsPromise = () => {
            return new Promise(( resolve, reject ) => {
               // CoreLibrary.offeringModule.getEventsByFilter('football/euro_2016/all/all/matches/')
               CoreLibrary.getData('all_matches.json')
                  .then(( response ) => {
                     if ( response && response.events && response.events.length ) {
                        resolve(response);
                     } else {
                        this.handleError('eventsPromise');
                     }
                  })
                  .catch(this.handleError);
            });
         };

         // get cms data
         this.cmsDataPromise = new Promise(( resolve, reject ) => {
            CoreLibrary.getData(this.scope.args.cmsUrl + this.scope.args.tournamentId + '/overview/overview.json?' +
               'version=' + (window.CMS_VERSIONS ? window.CMS_VERSIONS.overview : ''))
               .then(( response ) => {
                  if ( response && response.matches && response.players && response.teams ) {
                     resolve(response);
                  } else {
                     this.handleError('cmsDataPromise');
                  }
               })
               .catch(this.handleError);
         });

         // When both data fetching promises are resolved, we can create the modules and send them the data
         Promise.all([this.eventsPromise(), this.cmsDataPromise])
            .then(( promiseData ) => {
               var resizeTimeout = false;
               this.livePollingCount = 0;

               this.handleEvents(promiseData);

               window.addEventListener('resize', () => {
                  clearTimeout(resizeTimeout);

                  resizeTimeout = setTimeout(() => {
                     this.scope.is_mobile = this.is_mobile();
                     this.adjustHeight(true);
                  }, 300);

               });

               if ( /Edge/i.test(navigator.userAgent) ) {
                  var body = document.getElementsByTagName('body')[0];
                  body.classList.add('browser-edge');
               }

               // Delayed value to be passed on rv-cloak binder
               setTimeout(() => {
                  this.adjustHeight();
                  this.scope.loaded = true;
               }, 200);
            });
      },

      /**
       * Sets data to submodule and starts polling if there are live betoffers
       * @param promiseData
       */
      handleEvents ( promiseData ) {
         this.livePollingCount++;

         var upcoming_events = promiseData[0].events.filter(( event ) => {
            var ret = event.event.type === 'ET_MATCH';
            // timeNow = new Date();
            // if ( event.betOffers.length === 0 && event.event.start < timeNow ) {
            //    console.log('live odd');
            //    ret = false;
            // }
            return ret;
         });

         if ( !this.liveUpcoming ) {
            this.liveUpcoming = new window.LiveUpcoming('section#live-upcoming', upcoming_events, promiseData[1], this.scope);
         } else {
            this.liveUpcoming.setData(upcoming_events);
         }

         if ( this.livePolling != null ) {
            for ( var i in this.livePolling ) {
               if ( this.livePolling.hasOwnProperty(i) ) {
                  this.stopLivePolling(i);
               }
            }
         } else {
            this.livePolling = {};
         }

         upcoming_events.forEach(( event ) => {
            if ( this.livePollingCount < this.scope.args.pollingCount && event.event.openForLiveBetting === true ) {
               this.startLivePolling(event.event.id);
            }
         });
      },

      /**
       * Makes a request to fetch liveData
       * It will stop the interval if there is no live event
       * Triggers a filter refresh on request fail
       * @param eventId
       */
      getLiveEventData ( eventId ) {
         var getFn;
         if ( CoreLibrary.development === true ) {
            getFn = CoreLibrary.getData('live_' + eventId + '.json');
         } else {
            getFn = CoreLibrary.offeringModule.getLiveEventData(eventId);
         }
         getFn
            .then(( response ) => {
               if ( response && response.eventId ) {
                  this['liveUpcoming'].setLiveData(response);
                  if ( !response.open ) {
                     this.stopLivePolling(eventId);
                     this.liveUpcoming.scope.onResize();
                  }
               } else {
                  this.stopLivePolling(eventId);
                  this.liveUpcoming.scope.onResize();
               }
               this.refreshEvents();
            })
            .catch(( error ) => {
               this.stopLivePolling(eventId);
               this.refreshEvents();
            });
      },

      /**
       * Makes a request to updated filter data
       * if there are no live events polling
       */
      refreshEvents () {
         console.debug('Refresh events');
         if ( Object.keys(this.livePolling).length === 0 ) {
            Promise.all([this.eventsPromise()])
               .then(( promiseData ) => {
                  if ( promiseData[0].events && promiseData[0].events.length ) {
                     this.handleEvents(promiseData);
                     this.liveUpcoming.scope.onResize();
                  } else {
                     this.handleError('eventsPromise');
                  }
               }).catch(this.handleError);
         }
      },

      /**
       * Start an polling interval assigned to object by id
       * @param eventId
       */
      startLivePolling ( eventId ) {
         console.debug('start live polling', eventId);
         this.pollingInterval = this.scope.args.pollingInterval || 30000; // 30s
         this.livePolling[eventId] = setInterval(() => {
            this.getLiveEventData(eventId);
         }, this.pollingInterval);
      },

      /**
       * Clear interval and delete object containing it
       * @param eventId
       */
      stopLivePolling ( eventId ) {
         console.debug('stop live polling ', eventId);
         clearInterval(this.livePolling[eventId]);
         delete this.livePolling[eventId];
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
                  // Sort betoffer outcomes
                  this.sortOutcomes(events[i].betOffers[0].outcomes);
                  // If the return array is empty, add it
                  if ( ret[mappings[events[i].betOffers[0].criterion.id]].length === 0 ) {
                     ret[mappings[events[i].betOffers[0].criterion.id]].push(events[i]);
                  }
                  // if a live event, replace/add to the return array
                  if ( events[i].betOffers[0].live === true ) {
                     ret[mappings[events[i].betOffers[0].criterion.id]] = [events[i]];
                  }
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
         var contentHeight = 148; // required value

         if ( !this.scope.is_mobile ) {
            if ( resizeEvent ) {
               this.liveUpcoming.scope.onResize();
            }
         }
         CoreLibrary.widgetModule.setWidgetHeight(contentHeight);
      },

      /**
       * Compares start and end dates passed to determine widget visibility
       */
      // handleOnlineIntervals ( stateOverride ) {
      //    this.scope.offline_interval = true;
      //
      //    var interval = true,
      //       getInterval = ( intervalType ) => {
      //          var returnDates = {},
      //             date_now = new Date();
      //
      //          if ( typeof intervalType === 'object' && Object.keys(intervalType).length ) {
      //             var i = 0, arrLength = Object.keys(intervalType).length;
      //             for ( ; i < arrLength; ++i ) {
      //                var key = Object.keys(intervalType)[i],
      //                   value = intervalType[key];
      //
      //                var end = new Date(value),
      //                   start = new Date(key);
      //
      //                if ( date_now > start && date_now < end ) {
      //                   returnDates = {
      //                      start: start,
      //                      end: end
      //                   };
      //                }
      //             }
      //          }
      //          console.log(returnDates);
      //          return returnDates.hasOwnProperty('start');
      //       };
      //
      //    if ( this.scope.args.intervalUrl !== false && stateOverride !== true ) {
      //       return new Promise(( resolve, reject ) => {
      //          CoreLibrary.getData(this.scope.args.intervalUrl ? this.scope.args.intervalUrl : 'intervals.json')
      //             .then(( response ) => {
      //                if ( response ) {
      //                   if ( response.hasOwnProperty('offline_interval') ) {
      //                      interval = getInterval(response.offline_interval);
      //                   } else if ( response.hasOwnProperty('online_interval') ) {
      //                      interval = !getInterval(response.online_interval);
      //                   }
      //                   console.log('offline check', interval);
      //                   this.scope.offline_interval = interval;
      //                }
      //                resolve();
      //             })
      //             .catch(() => {
      //                resolve();
      //             });
      //       });
      //    } else {
      //       return new Promise(( resolve, reject ) => {
      //          if ( stateOverride ) {
      //             interval = stateOverride;
      //          }
      //          if ( this.scope.args.intervalUrl === false ) {
      //             interval = false;
      //          }
      //          this.scope.offline_interval = interval;
      //          resolve();
      //       });
      //    }
      // },

      /**
       * Makes Ajax request to retrieve customer css
       * If the request fails sets the default widget style
       */
      handleCustomCss () {
         this.customCssBaseUrl = ( this.scope.args.customCss ? this.scope.args.customCss : '' +
            this.scope.args.cmsUrl + 'euro16/css/{customer}/' ) + 'style.css';
         this.scope.customCssUrl = this.customCssBaseUrl.replace(/\{customer}/, CoreLibrary.config.customer);

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
         CoreLibrary.widgetModule.removeWidget();
      },

      /**
       * Check parent element width and return true if is under certain mobile value
       * @returns {boolean}
       */
      is_mobile () {
         var testBrowser = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
         return this.mainElement.offsetWidth <= 768 && ('ontouchstart' in window) && testBrowser;
      }

   });

   var euroOverview = new EuroOverview({
      rootElement: 'html'
   });

})();
