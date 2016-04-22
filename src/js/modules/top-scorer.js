var TopScorer = (function () {
   return CoreLibrary.Component.subclass({
      defaultArgs: {},

      htmlTemplateFile: './views/top-scorer.html',

      constructor: function ( htmlElement, event ) {
         CoreLibrary.Component.apply(this, [{
            rootElement: htmlElement
         }]);
         this.scope.event = event.betOffers[0].outcomes;

         // Assign an index number for each outcome
         var i = 0, arrLength = this.scope.event.length;
         for ( ; i < arrLength; ++i ) {
            var item = this.scope.event[i];
            if ( typeof item === 'object' ) {
               item.index = this.scope.event.indexOf(item);
            }
         }
      },

      init: function () {
         console.debug('Top scorer init');
         this.pagination = new CoreLibrary.PaginationComponent('#top-scorer-pagination', this.scope, 'event', 8);
      }
   });
})();
