(() => {

   /**
    * Checks getEventsByFilter response against matching events. Returns null if none found.
    * @param {Object} response getEventsByFilter response object
    * @returns {Object|null}
    */
   var verifyEventsResponse = function (response) {
      if (response && Array.isArray(response.events)) {
         var eventCount = response.events
            .reduce((c, ev) => ev.event.type === 'ET_MATCH' ? c + 1 : c, 0);

         // found matching events
         if (eventCount > 0) {
            return response;
         }

         // matching events not found
         return null;
      }

      // invalid response
      return null;
   };

   var MatchSchedule = CoreLibrary.Component.subclass({

      defaultArgs: {
         widgetTrackingName: 'gm-match-overview-widget',
         filter: [
            '/football/champions_league',
            '/football/england/premier_league',
            '/football/europa_league',
            '/football/france/ligue_1',
            '/football/germany/bundesliga',
            '/football/international_friendly_matches',
            '/football/italy/serie_a',
            '/football/norway/tippeligaen',
            '/football/spain/laliga',
            '/football/sweden/allsvenskan',
            '/football/world_cup_qualifying_-_asia',
            '/football/world_cup_qualifying_-_europe',
            '/football/world_cup_qualifying_-_north__central___caribbean',
            '/football/world_cup_qualifying_-_south_america',
            '/football/belgium/jupiler_pro_league',
            '/football/netherlands/eredivisie'
         ],
         combineFilters: false,
         customCssUrl: 'https://d1fqgomuxh4f5p.cloudfront.net/customcss/match-overview-widget/{customer}/style.css',
         customCssUrlFallback: 'https://d1fqgomuxh4f5p.cloudfront.net/customcss/match-overview-widget/kambi/style.css',
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

         this.blendBackground();

         this.mainElement = document.getElementById('main');
         this.scope.is_mobile = this.is_mobile();
         this.adjustLogoWidth();

         this.scope.appliedFilters = [];

         window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);

            resizeTimeout = setTimeout(() => {
               this.scope.is_mobile = this.is_mobile();
               this.adjustHeight(true);
               this.adjustLogoWidth();
            }, 300);

         });

         // Get the upcoming events
         this.getData = () => {
            var getEventsFunc = this.scope.args.combineFilters ? this.getEventsCombined.bind(this) : this.getEventsProgressively.bind(this);

            getEventsFunc(this.scope.appliedFilters)
               .then(( response ) => {
                  if ( response ) {
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
                     this.handleError('not enough events');
                  }
               })
               .catch(this.handleError);
         };

         this.checkHighlight()
            .then(this.getData)
            .catch(this.handleError);
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
       * Fetches events by combining given filters together.
       * @param {String[]} filters
       * @returns {Promise.<Object|null>}
       */
      getEventsCombined (filters) {
         var url = CoreLibrary.widgetModule.createFilterUrl(filters);
         var replaceString = '#filter/';
         this.scope.logoName = 'combined-filters';

         if ( CoreLibrary.config.routeRoot !== '' ) {
            replaceString = '#' + CoreLibrary.config.routeRoot + '/filter/';
         }

         url = url ? url.replace(replaceString, '') : 'football';

         return CoreLibrary.offeringModule.getEventsByFilter(url)
            .then(verifyEventsResponse);
      },

      /**
       * Fetches events by checking filters one after another until finding matching events.
       * @param {String[]} filters
       * @returns {Promise.<Object|null>}
       */
      getEventsProgressively (filters) {
         // start searching for events
         var loop = (i) => {
            if (i >= filters.length) {
               // no more filters to check
               return null;
            }
            // checking ith filter
            return CoreLibrary.offeringModule.getEventsByFilter(filters[i].replace(/^\//, ''))
               // uncomment this to test falling back to the second filter
               // .then((res) => {
               //    if (i < 1) {
               //       res.events = [];
               //    }
               //    return res;
               // })
               .then(verifyEventsResponse)
               .then((response) => {
                  if (response !== null) {
                     this.scope.logoName = filters[i].substring(1).replace(/\//g, '-');
                     return response;
                  }

                  // matching events not found, proceed to next filter
                  return Promise.resolve(i + 1)
                     .then(loop);
               });
         };

         return Promise.resolve(0)
            .then(loop);
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
                  var online = false;
                  if ( Array.isArray(response.groups) ) {
                     var filteredPaths = response.groups.filter(( value, index, arr ) => {
                        return this.scope.args.filter.indexOf(value.pathTermId) !== -1;
                     });
                     if ( filteredPaths.length > 0 ) {
                        console.debug('Found ' + filteredPaths.length + ' supported filter(s), widget is online');
                        filteredPaths.forEach(( path ) => {
                           this.scope.appliedFilters.push(path.pathTermId);
                        });
                        online = true;
                        resolve();
                     } else {
                        reject('No matching filters in highlight, widget is offline');
                     }
                  } else {
                     reject('Highlight response empty, hiding widget');
                  }
                  if ( online === false ) {
                     this.handleError('widget, offline');
                     reject();
                  }
               })
               .catch(( err ) => {
                  reject(err);
               });
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
       * Adjust the width of the logo depending on if device is mobile or not
       */
      adjustLogoWidth () {
         if ( this.scope.is_mobile ) {
            this.scope.logoWidth = 80;
         } else {
            this.scope.logoWidth = 90;
         }
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
         var svgBlend = document.querySelector('#background-image');
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
