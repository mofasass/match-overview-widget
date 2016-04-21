(function () {
   'use strict';

   var EuroOverview = CoreLibrary.Component.subclass({

      defaultArgs: {

      },

      constructor: function () {
         CoreLibrary.Component.apply(this, arguments);
      },

      init: function () {
         console.debug('Init callback');
      }

   });

   var euroOverview = new EuroOverview({
      rootElement: 'html'
   });

})();