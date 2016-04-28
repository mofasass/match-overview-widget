(function () {

   var OutcomeViewController = function ( attributes ) {
      this.data = attributes;
      this.selected = false;

      Stapes.on('OUTCOME:ADDED:' + this.data.outcomeAttr.id, ( data, event ) => {
         this.selected = true;
      });

      Stapes.on('OUTCOME:REMOVED:' + this.data.outcomeAttr.id, ( data, event ) => {
         this.selected = false;
      });

      this.toggleOutcome = function ( event, scope ) {
         if ( scope.selected === false ) {
            CoreLibrary.widgetModule.addOutcomeToBetslip(scope.data.outcomeAttr.id);
         } else {
            CoreLibrary.widgetModule.removeOutcomeFromBetslip(scope.data.outcomeAttr.id);
         }
      };
   };

   rivets.components['outcome-component-no-label'] = {
      template: function () {
         return '<button rv-on-click="toggleOutcome" rv-disabled="betOffer.suspended | == true"' +
            'rv-custom-class="selected" rv-toggle-class="KambiWidget-outcome--selected" ' +
            'type="button" role="button" class="KambiWidget-outcome kw-link l-ml-6">' +
            '<div class="l-flexbox l-pack-center">' +
            '<div class="KambiWidget-outcome__odds-wrapper">' +
            '<span class="KambiWidget-outcome__odds">{data.outcomeAttr.odds | / 1000 }</span>' +
            '</div>' +
            '</div>' +
            '</button>';
      },

      initialize: function ( el, attributes ) {
         return new OutcomeViewController(attributes);
      }
   };
})();