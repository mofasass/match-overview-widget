var TopScorer = (function () {
   return CoreLibrary.Component.subclass({
      defaultArgs: {},

      htmlTemplateFile: './views/top-scorer.html',

      constructor: function () {
         CoreLibrary.Component.apply(this, arguments);
      },

      init: function () {
         console.debug('Top scorer init');
      }
   });
})();