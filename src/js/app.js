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
               .then(function (response) {
                  resolve(response);
               }.bind(this));
         }.bind(this));

         // Get the betoffers
         var betofferPromise = new Promise(function ( resolve, reject ) {
            resolve();
         }.bind(this));

         // When both data fetching promises are resolved, we can create the modules and send them the data
         Promise.all([eventsPromise, betofferPromise])
            .then(function (promiseData) {

               console.debug('both promises resolved');

               var liveUpcoming = new LiveUpcoming({
                  rootElement: 'div#live-upcoming',
                  events: promiseData[0]
               });

               var groups = new Groups({
                  rootElement: 'div#groups'
               });

               var topScorer = new TopScorer({
                  rootElement: 'div#top-scorer'
               });

               var tournamentWinner = new TournamentWinner({
                  rootElement: 'div#tournament-winner'
               });

            }.bind(this));

      }

   });

   var euroOverview = new EuroOverview({
      rootElement: 'html'
   });

})();
