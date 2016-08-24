(() => {

   var MatchSchedule = CoreLibrary.Component.subclass({

      defaultArgs: {
         widgetTrackingName: 'gm-schedule-widget-pl',
         tournamentName: 'pl',
         filter: [
            '/football/france/ligue_1',
            '/football/england/premier_league',
            '/football/germany/bundesliga'
         ],
         dataUrl: 'https://d1fqgomuxh4f5p.cloudfront.net/tournamentdata/',
         criterionId: '',
         pollingInterval: 30000,
         pollingCount: 4
      },

      constructor () {
         CoreLibrary.Component.apply(this, arguments);
         this.events = [];
      },

      init () {
         var resizeTimeout = false;
         CoreLibrary.setWidgetTrackingName(this.scope.args.widgetTrackingName);

         CoreLibrary.widgetModule.enableWidgetTransition(true);

         this.handleCustomCss();

         // var path = ['/football/england/premier_league',
         //    '/football/champions_league/all',
         //    '/football/world_cup_qualifying_-_europe/all',
         //    '/football/france/ligue_1'];

         this.mainElement = document.getElementById('main');
         this.scope.is_mobile = this.is_mobile();

         this.scope.appliedFilter = null;

         window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);

            resizeTimeout = setTimeout(() => {
               this.scope.is_mobile = this.is_mobile();
               this.adjustHeight(true);
            }, 300);

         });

         // Get the upcoming events
         this.getData = () => {
            var url = CoreLibrary.widgetModule.createFilterUrl([this.scope.appliedFilter]);
            var replaceString = '#filter/';
            if ( CoreLibrary.config.routeRoot !== '' ) {
               replaceString = '#' + CoreLibrary.config.routeRoot + '/filter/';
            }
            url = url ? url.replace(replaceString, '') : 'football';
            CoreLibrary.offeringModule.getEventsByFilter(url)
               .then(( response ) => {
                  if ( response && response.events && response.events.length ) {
                     this.livePollingCount = 0;

                     this.handleEvents(response);

                     if ( /Edge/i.test(navigator.userAgent) ) {
                        var body = document.getElementsByTagName('body')[0];
                        body.classList.add('browser-edge');
                     }

                     // Delayed value to be passed on rv-cloak binder
                     setTimeout(() => {
                        this.adjustHeight();
                        this.scope.loaded = true;
                     }, 200);
                  } else {
                     this.handleError('getData');
                  }
               })
               .catch(this.handleError);
         };

         this.checkHighlight()
            .then(this.getData)
            .catch(( errorMsg )=> {
               console.debug(errorMsg);
            });
      },

      /**
       * Sets data to submodule and starts polling if there are live betoffers
       * @param data
       */
      handleEvents ( data ) {
         this.livePollingCount++;

         var events = data.events.filter(( event ) => {
            return event.event.type === 'ET_MATCH';
         });

         if ( !this.module ) {
            this.module = new window.MatchesSchedule('#match-schedule', events, data, this.scope);
         } else {
            this.module.setData(events);
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

         events.forEach(( event ) => {
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
         // if ( CoreLibrary.development === true ) {
         //    getFn = CoreLibrary.getData('live_' + eventId + '.json');
         // } else {
         getFn = CoreLibrary.offeringModule.getLiveEventData(eventId);
         // }
         getFn
            .then(( response ) => {
               if ( response && response.eventId ) {
                  this.module.setLiveData(response);
                  if ( !response.open ) {
                     this.stopLivePolling(eventId);
                     this.module.scope.onResize();
                  }
               } else {
                  this.stopLivePolling(eventId);
                  this.module.scope.onResize();
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
         if ( Object.keys(this.livePolling).length === 0 ) {
            this.getData();
         }
      },

      /**
       * Start an polling interval assigned to object by id
       * @param eventId
       */
      startLivePolling ( eventId ) {
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
         clearInterval(this.livePolling[eventId]);
         delete this.livePolling[eventId];
      },

      /**
       * Checks the highlight resource against the supported filters and decides whether the widget is online or not
       */
      checkHighlight () {
         return new Promise(( resolve, reject ) => {
            CoreLibrary.offeringModule.getHighlight()
               .then(( response ) => {
                  if ( Array.isArray(response.groups) ) {
                     var filteredPaths = response.groups.filter(( value, index, arr ) => {
                        return this.scope.args.filter.indexOf(value.pathTermId) !== -1;
                     });
                     if ( filteredPaths.length > 0 ) {
                        console.debug('Found supported filter, widget is online');
                        this.scope.appliedFilter = filteredPaths[0].pathTermId;
                        this.scope.online = true;
                        resolve();
                     } else {
                        this.scope.online = false;
                        reject('No matching filters in highlight, widget is offline');
                     }
                  } else {
                     this.scope.online = false;
                     reject('Highlight response empty, hiding widget');
                  }
                  if ( !this.scope.online ) {
                     this.handleError('widget, offline');
                     reject();
                  }
               })
               .catch(() => {
                  this.scope.online = false;
                  reject('Error fetching highlight resource');
               });
         });

      },

      /**
       * Goes through an array of events filters out the events with betoffers that can be mapped based on their criterion id
       * @param {Array} events An array of event objects containing events and betOffers
       * @returns {{groups: Array, goldenBoot: Array, tournamentWinner: Array}}
       */
      filterOutBetOffers ( events ) {
         // The return object
         var ret = [];

         // Iterate over the events array
         var i = 0, len = events.length;
         for ( ; i < len; ++i ) {
            // Check if the event has one and only one betOffer
            if ( events[i].betOffers != null && events[i].betOffers ) {
               // Check if the criterion id is one we've mapped
               if ( this.scope.args.criterionIds && this.scope.args.criterionIds === events[i].betOffers[0].criterion.id ) {
                  // Sort betoffer outcomes
                  this.sortOutcomes(events[i].betOffers[0].outcomes);
                  // If the return array is empty, add it
                  if ( ret.length === 0 ) {
                     ret.push(events[i]);
                  }
                  // if a live event, replace/add to the return array
                  if ( events[i].betOffers[0].live === true ) {
                     ret = [events[i]];
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
               this.module.scope.onResize();
            }
         }
         CoreLibrary.widgetModule.setWidgetHeight(contentHeight);
      },

      /**
       * Makes Ajax request to retrieve customer css
       * If the request fails sets the default widget style
       */
      handleCustomCss () {
         this.dataUrl = ( this.scope.args.dataUrl ? this.scope.args.dataUrl + '{tournament}/css/{customer}/' : '' +
            '//kambi-cdn.globalmouth.com/tournamentdata/{tournament}/css/{customer}/' ) + 'style.css';
         this.scope.customCssUrl = this.dataUrl.replace(/\{customer}/, CoreLibrary.config.customer).replace(/\{tournament}/, this.scope.args.tournamentName);

         fetch(this.scope.customCssUrl)
            .then(( response ) => {
               if ( response.status >= 200 && response.status < 300 ) {
                  this.scope.customCss = this.scope.customCssUrl;
               } else {
                  this.scope.customCss = 'custom/style.local.css';
               }
               this.blendBackground();
            })
            .catch(( error ) => {
               this.scope.customCss = 'custom/style.local.css';
               this.blendBackground();
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
      },

      /**
       * Check if we are in a mobile or desktop and then set the correct image for the svg blend filter
       */
      blendBackground () {
         var svgBlend = document.querySelector('feImage[result="slide2"]');
         var background = 'custom/overview-bw-bg-desktop.jpg';
         if ( this.scope.is_mobile ) {
            background = 'custom/overview-bw-bg-mobile.jpg';
         }
         svgBlend.removeAttributeNS('http://www.w3.org/199/xlink', 'xlink:href');
         svgBlend.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', background);
      }

   });

   var matchSchedule = new MatchSchedule({
      rootElement: 'html'
   });

})();
