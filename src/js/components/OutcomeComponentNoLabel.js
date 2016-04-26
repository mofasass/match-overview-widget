(function () {

   var OutcomeViewController = function ( attributes ) {
      this.data = attributes;

      this.toggleOutcome = function (event, scope) {
         CoreLibrary.widgetModule.addOutcomeToBetslip(scope.data.outcomeAttr.id);
      };
   };

   rivets.components['outcome-component-no-label'] = {
      template: function () {
         return '<button rv-on-click="toggleOutcome" rv-disabled="betOffer.suspended | == true"' +
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