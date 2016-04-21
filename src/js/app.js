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
            rootElement: 'div#live-upcoming'
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

      }

   });

   var euroOverview = new EuroOverview({
      rootElement: 'html'
   });

})();
