var LiveUpcoming = (function () {
   return CoreLibrary.Component.subclass({
      defaultArgs: {},

      htmlTemplateFile: './views/live-upcoming.html',

      constructor: function () {
         CoreLibrary.Component.apply(this, arguments);
      },

      init: function () {
         console.debug('Liveupcoming init');
      }
   });
})();