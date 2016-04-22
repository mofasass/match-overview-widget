var TournamentWinner = (function () {
   return CoreLibrary.Component.subclass({
      defaultArgs: {},

      htmlTemplateFile: './views/tournament-winner.html',

      constructor: function ( htmlElement, event ) {
         CoreLibrary.Component.apply(this, [{
            rootElement: htmlElement
         }]);
         this.scope.event = event;
      },

      init: function () {
         console.debug('Tournament winner init');

         this.scope.data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 11, 12, 13, 14];

         this.pagination = new CoreLibrary.PaginationComponent('#tour-winner-pagination', this.scope, 'data', 8);
      }
   });
})();
