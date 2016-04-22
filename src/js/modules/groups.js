var Groups = (function () {
   return CoreLibrary.Component.subclass({
      defaultArgs: {},

      htmlTemplateFile: './views/groups.html',

      constructor: function ( htmlElement, events ) {
         CoreLibrary.Component.apply(this, [{
            rootElement: htmlElement
         }]);
         this.scope.events = events;
      },

      init: function () {
         console.debug('Groups init');
      }
   });
})();
