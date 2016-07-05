var TournamentWinner = (() => {
   return CoreLibrary.Component.subclass({
      defaultArgs: {},

      htmlTemplate: 'tournament-winner-view',

      constructor ( htmlElement, event, teamData ) {
         CoreLibrary.Component.apply(this, [{
            rootElement: htmlElement
         }]);
         this.scope.teamData = teamData;
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

         var i = 0, arrLength = 3;
         for ( ; i < arrLength; ++i ) {
            var item = this.scope.outcomes[i];
            if ( typeof item === 'object' ) {
               item.teamData = this.scope.teamData[item.participantId];
            }
         }
      },

      navigateToDetail () {
         CoreLibrary.widgetModule.navigateToEvent(this.scope.event.id);
      }
   });
})();
