var TournamentWinner = ( () => {
   return CoreLibrary.Component.subclass({
      defaultArgs: {},

      htmlTemplateFile: './views/tournament-winner.html',

      constructor ( htmlElement, event, teamData ) {
         CoreLibrary.Component.apply(this, [{
            rootElement: htmlElement
         }]);
         this.scope.event = event.event;
         this.scope.participantString = CoreLibrary.translationModule
            .getTranslation('Show all {0} participants')
            .replace(/\{0}/, event.betOffers[0].outcomes.length);
         this.scope.outcomes = event.betOffers[0].outcomes.slice(0, 3);
         this.scope.teamData = teamData;
         this.scope.navigateToDetail = this.navigateToDetail.bind(this);

         // Assign an index number for each outcome
         var i = 0, arrLength = 3;
         for ( ; i < arrLength; ++i ) {
            var item = this.scope.outcomes[i];
            if ( typeof item === 'object' ) {
               item.teamData = this.scope.teamData[item.participantId];
               item.index = this.scope.outcomes.indexOf(item);
            }
         }
      },

      init () {
      },

      navigateToDetail () {
         CoreLibrary.widgetModule.navigateToEvent(this.scope.event.id);
      }
   });
})();
