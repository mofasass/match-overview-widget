var TournamentWinner = (function () {
   return CoreLibrary.Component.subclass({
      defaultArgs: {},

      htmlTemplateFile: './views/tournament-winner.html',

      constructor: function ( htmlElement, event, teamData ) {
         CoreLibrary.Component.apply(this, [{
            rootElement: htmlElement
         }]);
         this.scope.event = event.betOffers[0].outcomes;
         this.scope.teamData = teamData;

         // Assign an index number for each outcome
         var i = 0, arrLength = this.scope.event.length;
         for ( ; i < arrLength; ++i ) {
            var item = this.scope.event[i];
            if ( typeof item === 'object' ) {
               item.teamData = this.scope.teamData[item.participantId];
               item.index = this.scope.event.indexOf(item);
            }
         }
      },

      init: function () {
         var swiper = new CoreLibrary.SwipeComponent(document.getElementById('teams-slider'));
      }
   });
})();
