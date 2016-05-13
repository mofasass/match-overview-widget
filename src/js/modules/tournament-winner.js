var TournamentWinner = ( () => {
   return CoreLibrary.Component.subclass({
      defaultArgs: {},

      htmlTemplateFile: './views/tournament-winner.html',

      constructor ( htmlElement, event, teamData ) {
         CoreLibrary.Component.apply(this, [{
            rootElement: htmlElement
         }]);
         this.scope.event = event.betOffers[0].outcomes.slice(0,3);
         this.scope.count = event.betOffers[0].outcomes.length;
         this.scope.teamData = teamData;

         // Assign an index number for each outcome
         var i = 0, arrLength = 3;
         for ( ; i < arrLength; ++i ) {
            var item = this.scope.event[i];
            if ( typeof item === 'object' ) {
               item.teamData = this.scope.teamData[item.participantId];
               item.index = this.scope.event.indexOf(item);
            }
         }
      },

      init () {
      }
   });
})();
