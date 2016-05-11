var GoldenBoot = (function () {
   return CoreLibrary.Component.subclass({
      defaultArgs: {},

      htmlTemplateFile: './views/golden-boot.html',

      constructor: function ( htmlElement, event, cmsData ) {
         CoreLibrary.Component.apply(this, [{
            rootElement: htmlElement
         }]);
         this.scope.outcomes = event.betOffers[0].outcomes;
         this.scope.playerData = cmsData.players;
         this.scope.teamData = cmsData.teams;

         // Assign an index number for each outcome
         var i = 0, arrLength = this.scope.outcomes.length;
         for ( ; i < arrLength; ++i ) {
            var item = this.scope.outcomes[i];
            if ( typeof item === 'object' ) {
               item.cmsData = {};
               if ( item.participantId != null && this.scope.playerData[item.participantId] != null ) {
                  item.cmsData.playerData = this.scope.playerData[item.participantId];
                  item.cmsData.teamData = this.scope.teamData[item.cmsData.playerData.teamId];
               }
               item.index = this.scope.outcomes.indexOf(item);
            }
         }
      },

      init: function () {
      }
   });
})();
