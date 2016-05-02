var GoldenBoot = (function () {
   return CoreLibrary.Component.subclass({
      defaultArgs: {},

      htmlTemplateFile: './views/golden-boot.html',

      constructor: function ( htmlElement, event ) {
         CoreLibrary.Component.apply(this, [{
            rootElement: htmlElement
         }]);
         this.scope.outcomes = event.betOffers[0].outcomes;

         // Assign an index number for each outcome
         var i = 0, arrLength = this.scope.outcomes.length;
         for ( ; i < arrLength; ++i ) {
            var item = this.scope.outcomes[i];
            if ( typeof item === 'object' ) {
               item.index = this.scope.outcomes.indexOf(item);
            }
         }
      },

      init: function () {
         this.pagination = new CoreLibrary.PaginationComponent('#golden-boot-pagination', this.scope, 'outcomes', 9);
      }
   });
})();
