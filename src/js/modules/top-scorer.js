var TopScorer = (function () {
   return CoreLibrary.Component.subclass({
      defaultArgs: {},

      htmlTemplateFile: './views/top-scorer.html',

      constructor: function () {
         CoreLibrary.Component.apply(this, arguments);

         this.scope = {};
      },

      init: function () {
         console.debug('Top scorer init');

         this.scope.data = [1,2,3,4,5,6,7,8,9];

         this.pagination = new CoreLibrary.PaginationComponent('#top-scorer-pagination', this.scope, 'data', 8);
      }
   });
})();
