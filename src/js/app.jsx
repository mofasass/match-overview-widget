import {
  coreLibrary,
  eventsModule,
  widgetModule
} from 'kambi-wc-widget-core-library'
import kambi from './Services/kambi'
import Widget from './Widget'
import * as filters from './constants'
import { setConfigValues } from 'kambi-offering-api-module'
import retargetEvents from 'react-shadow-dom-retarget-events'

const customElementName = 'match-overview-widget';

/**
 * Removes widget on fatal errors.
 * @param {Error} error Error instance
 */
const onFatal = function(error) {
  console.error(error)
  widgetModule.removeWidget()
}

// Do not define the WC again if already defined
if (customElements.get(customElementName) === undefined) {
  class MatchOverviewWidget extends HTMLElement {
    constructor() {
      super(); 
    }

    connectedCallback() {
      const shadowRoot = this.attachShadow({mode: 'open'});

      /* TEMPORARY FIX TO ADD WIDGET CSS */

      const widgetCss = document.createElement('link');
      widgetCss.setAttribute('rel', 'stylesheet');
      widgetCss.setAttribute('type', 'text/css');
      widgetCss.setAttribute('href', 'https://c3-static.kambi.com/sb-mobileclient/widget-api/1.0.0.89/resources/css/kambi/kambi/widgets.css');

      const coreCss = document.createElement('link');
      coreCss.setAttribute('rel', 'stylesheet');
      coreCss.setAttribute('type', 'text/css');
      coreCss.setAttribute('href', 'http://localhost:9090/main.css');

      /* END OF TEMP FIX */

      coreLibrary
        .init({
          widgetTrackingName: 'gm-match-overview-widget',
          compareAgainstHighlights: true,
          filter: Object.keys(filters).reduce(
            (arr, key) => [...arr, ...filters[key]],
            []
          ),
          combineFilters: false,
          pollingInterval: 30000,
          pollingCount: 4,
          eventsRefreshInterval: 120000,
          shadowRoot: shadowRoot
        })
        .then(() => {
          setConfigValues(coreLibrary.config)
          coreLibrary.widgetTrackingName = coreLibrary.args.widgetTrackingName
          eventsModule.liveEventPollingInterval = coreLibrary.args.pollingInterval

          return coreLibrary.args.compareAgainstHighlights // set this arg to false to test specific filters
            ? kambi.getHighlightedFilters(coreLibrary.args.filter)
            : coreLibrary.args.filter
        })
        .then(filters => {
          if (filters.length === 0) {
            onFatal(new Error('No matching filters in highlight'))
            return
          }
      
          const widget = new Widget(filters, {
            combineFilters: coreLibrary.args.combineFilters,
            eventsRefreshInterval: coreLibrary.args.eventsRefreshInterval,
            pollingCount: coreLibrary.args.pollingCount,
            onFatal,
          })
      
          return widget.init()
        })
        .then(() => {
          retargetEvents(shadowRoot);
          shadowRoot.appendChild(widgetCss);
          shadowRoot.appendChild(coreCss);
        })
        .catch(onFatal);
    }
  }

  customElements.define(customElementName, MatchOverviewWidget);

}








