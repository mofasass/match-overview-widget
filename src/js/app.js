(function () {
   'use strict';

   var EuroOverview = CoreLibrary.Component.subclass({

      defaultArgs: {
         filter: ''
      },

      constructor: function () {
         CoreLibrary.Component.apply(this, arguments);

         this.events = [];
      },

      init: function () {

         // Get the upcoming events
         var eventsPromise = new Promise(function ( resolve, reject ) {
            CoreLibrary.offeringModule.getEventsByFilter('football/euro_2016_matches/')
               .then(function ( response ) {
                  resolve(response);
               }.bind(this));
         }.bind(this));

         // Get the betoffers
         var betofferPromise = new Promise(function ( resolve, reject ) {
            CoreLibrary.offeringModule.getEventsByFilter('football/euro_2016_tournament_bets/all/all/competitions/')
               .then(function ( response ) {
                  resolve(response);
               }.bind(this));
         }.bind(this));

         // When both data fetching promises are resolved, we can create the modules and send them the data
         Promise.all([eventsPromise, betofferPromise])
            .then(function ( promiseData ) {


               var liveUpcoming = new LiveUpcoming({
                  rootElement: 'section#live-upcoming',
                  events: promiseData[0]
               });

               var filteredEvents = this.filterOutBetOffers(promiseData[1].events)

               if ( filteredEvents.groups != null ) {
                  var groups = new Groups('section#groups', filteredEvents.groups);
               }

               if ( filteredEvents.topScorer != null ) {
                  var topScorer = new TopScorer('section#top-scorer', filteredEvents.topScorer[0]);
               }

               if ( filteredEvents.tournamentWinner != null ) {
                  var tournamentWinner = new TournamentWinner('section#tournament-winner', filteredEvents.tournamentWinner[0]);
               }

            }.bind(this));

      },

      /**
       * Goes through an array of events filters out the events with betoffers that can be mapped based on their criterion id
       * @param {Array} events An array of event objects containing events and betOffers
       * @returns {{groups: Array, topScorer: Array, tournamentWinner: Array}}
       */
      filterOutBetOffers: function ( events ) {
         // Map the criterion
         var mappings = {
            1001615382: 'groups',
            1001304945: 'topScorer',
            1001221607: 'tournamentWinner'
         };

         // The return object
         var ret = {
            groups: [],
            topScorer: [],
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
                  ret[mappings[events[i].betOffers[0].criterion.id]].push(events[i]);
               }
            }
         }

         return ret;
      }
   });

   var euroOverview = new EuroOverview({
      rootElement: 'html'
   });

})();
