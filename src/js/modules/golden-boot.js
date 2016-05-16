var GoldenBoot = (() => {
   return CoreLibrary.Component.subclass({
      defaultArgs: {},

      htmlTemplateFile: './views/golden-boot.html',

      constructor ( htmlElement, event, cmsData ) {
         CoreLibrary.Component.apply(this, [{
            rootElement: htmlElement
         }]);
         this.scope.event = event.event;
         this.scope.participantString = CoreLibrary.translationModule
            .getTranslation('Show all {0} participants')
            .replace(/\{0}/, event.betOffers[0].outcomes.length);
         this.scope.outcomes = event.betOffers[0].outcomes.slice(0, 3);
         this.scope.playerData = cmsData.players;
         this.scope.teamData = cmsData.teams;
         this.scope.navigateToDetail = this.navigateToDetail.bind(this);

         // Assign an index number for each outcome
         var i = 0, arrLength = this.scope.outcomes.length;
         for ( ; i < arrLength; ++i ) {
            var item = this.scope.outcomes[i];
            item.label = item.label.split(' ')[0] + ' ' + item.label.split(' ')[1].slice(0, 1);
            if ( typeof item === 'object' ) {
               item.cmsData = {};
               if ( item.participantId != null && this.scope.playerData[item.participantId] != null ) {
                  item.cmsData.playerData = this.scope.playerData[item.participantId];
                  item.cmsData.teamData = this.scope.teamData[item.cmsData.playerData.teamId];
               }
               item.index = this.scope.outcomes.indexOf(item);
            }
            console.log(item);
         }
      },

      init () {
      },
      navigateToDetail () {
         CoreLibrary.widgetModule.navigateToEvent(this.scope.event.id);
      }
   });
})();
