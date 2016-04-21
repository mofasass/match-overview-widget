var Groups = (function () {
   return CoreLibrary.Component.subclass({
      defaultArgs: {},

      htmlTemplateFile: './views/groups.html',

      constructor: function () {
         CoreLibrary.Component.apply(this, arguments);
      },

      init: function () {
         console.debug('Groups init');
      }
   });
})();