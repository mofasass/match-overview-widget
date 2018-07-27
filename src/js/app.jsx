import {
  coreLibrary,
  eventsModule,
  widgetModule,
} from 'kambi-widget-core-library'
import kambi from './Services/kambi'
import Widget from './Widget'

import { supportedFilters } from './constants'
/**
 * Removes widget on fatal errors.
 * @param {Error} error Error instance
 */
const onFatal = function(error) {
  console.error(error)
  widgetModule.removeWidget(error)
}

coreLibrary
  .init({
    widgetTrackingName: 'gm-match-overview-widget',
    compareAgainstHighlights: true,
    filter: supportedFilters,
    combineFilters: false,
    pollingInterval: 30000,
    pollingCount: 4,
    eventsRefreshInterval: 120000,
    highlightBasedOnBetslip: true,
    backgroundUrl: null,
    iconUrl: null,
  })
  .then(() => {
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
  .catch(onFatal)
