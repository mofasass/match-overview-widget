var GoldenBoot = (() => {
   return CoreLibrary.Component.subclass({
      defaultArgs: {},

      htmlTemplate: 'golden-boot-view',

      constructor ( htmlElement, event, cmsData ) {
         CoreLibrary.Component.apply(this, [{
            rootElement: htmlElement
         }]);
         this.scope.playerData = cmsData.players;
         this.scope.teamData = cmsData.teams;
         this.scope.navigateToDetail = this.navigateToDetail.bind(this);

         this.setData(event);
      },

      init () {
      },

      resetScope () {
         this.scope.outcomes = null;
         this.scope.event = null;
      },

      setData ( event ) {
         this.resetScope();
         this.scope.event = event.event;
         this.scope.outcomes = event.betOffers[0].outcomes.slice(0, 3);
         this.scope.participantString = CoreLibrary.translationModule
            .getTranslation('Show all {0} participants')
            .replace(/\{0}/, event.betOffers[0].outcomes.length);

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
            }
         }
      },

      navigateToDetail () {
         CoreLibrary.widgetModule.navigateToEvent(this.scope.event.id);
      }
   });
})();
