var TournamentWinner = (function () {
   return CoreLibrary.Component.subclass({
      defaultArgs: {},

      htmlTemplateFile: './views/tournament-winner.html',

      constructor: function () {
         CoreLibrary.Component.apply(this, arguments);
      },

      init: function () {
         console.debug('Tournament winner init');
      }
   });
})();