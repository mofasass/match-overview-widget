var Groups = (function () {
   return CoreLibrary.Component.subclass({
      defaultArgs: {},

      htmlTemplateFile: './views/groups.html',

      constructor: function () {
         CoreLibrary.Component.apply(this, arguments);
         this.scope = {};
      },

      init: function () {
         console.debug('Groups init');
         this.scope.groups = [{
            group: 'Group A',
            data: ['Romania', 'France', 'Albania', 'Switzerland']
         },
            {
            group: 'Group B',
            data: ['Romania', 'France', 'Albania', 'Switzerland']
         }];
      }
   });
})();
