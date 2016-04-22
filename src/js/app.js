(function () {
   'use strict';

   var EuroOverview = CoreLibrary.Component.subclass({

      defaultArgs: {},

      constructor: function () {
         CoreLibrary.Component.apply(this, arguments);
      },

      init: function () {

         console.log(this);
         console.debug('Init callback');

         var liveUpcoming = new LiveUpcoming({
            rootElement: 'section#live-upcoming'
         });

         var groups = new Groups({
            rootElement: 'section#groups'
         });

         var topScorer = new TopScorer({
            rootElement: 'section#top-scorer'
         });

         var tournamentWinner = new TournamentWinner({
            rootElement: 'section#tournament-winner'
         });

      }

   });

   var euroOverview = new EuroOverview({
      rootElement: 'html'
   });

})();
