import { coreLibrary, widgetModule } from 'kambi-wc-widget-core-library'

import { getHighlights, getEventsByFilter } from 'kambi-offering-api-module'

/**
 * Checks the highlight resource against the supported filters and decides whether the widget is online or not
 * @param {string[]} supportedFilters Supported filters
 * @returns Promise.<string[]>
 */
const getHighlightedFilters = function(supportedFilters) {
  return getHighlights().then(groups => {
    if (!Array.isArray(groups)) {
      throw new Error('Highlight response empty, hiding widget')
    }
    // response.groups[0].pathTermId = "/football/england/efl_cup"
    // response.groups = response.groups.slice(0, 1);
    return groups
      .map(group => group.pathTermId)
      .filter(filter => supportedFilters.indexOf(filter) !== -1)
  })
}

/**
 * Filters events that are matches from getEventsByFilter response. Also filters out events whose englishName are "Home Teams - Away Teams"
 * @param {object} response getEventsByFilter response
 * @returns {object[]}
 */
const filterEvents = function(response) {
  if (!response || !Array.isArray(response.events)) {
    return []
  }

  return response.events.filter(event => {
    return (
      event.englishName !== 'Home Teams - Away Teams' &&
      event.tags.indexOf('MATCH') !== -1
    )
  })
}

/**
 * Fetches events by combining given filters together.
 * @param {String[]} filters
 * @returns {Promise.<object[]>}
 */
const getEventsCombined = function(filters) {
  const filter = widgetModule.createFilterUrl(filters)
  let replaceString = '#filter/'

  if (coreLibrary.config.routeRoot !== '') {
    replaceString = '#' + coreLibrary.config.routeRoot + '/filter/'
  }

  const url = filter ? filter.replace(replaceString, '') : 'football'

  return getEventsByFilter(url)
    .then(filterEvents)
    .then(events => {
      return { events, filter }
    })
}

/**
 * Fetches events by checking filters one after another until finding matching events.
 * @param {String[]} filters Filters to check
 * @returns {Promise.<{filter: string, events: object[]}>}
 */
const getEventsProgressively = function(filters) {
  // start searching for events
  const loop = i => {
    if (i >= filters.length) {
      // no more filters to check
      return null
    }
    // checking ith filter
    return (
      getEventsByFilter(filters[i].replace(/^\//, ''))
        // uncomment this to test falling back to the second filter
        // .then((res) => {
        //    if (i < 1) {
        //       res.events = [];
        //    }
        //    return res;
        // })
        .then(filterEvents)
        .then(events => {
          if (events.length > 0) {
            // found matching events
            return { filter: filters[i], events }
          }

          // matching events not found, proceed to next filter
          return Promise.resolve(i + 1).then(loop)
        })
    )
  }

  return Promise.resolve(0)
    .then(loop)
    .then(ev => {
      if (ev == null) {
        throw new Error('No matches available in any of the supported filters')
      } else {
        return ev
      }
    })
}

/**
 * Fetches events for given filter list.
 * Returns object having events array and applied filter field.
 * @param {string[]} filters Filters
 * @param {boolean} combined Whether events should be fetched using single combined query or one filter at the time
 * @returns {Promise.<{events: object[], filter: string}>}
 */
const getEvents = function(filters, combined = true) {
  const getEventsFunc = combined ? getEventsCombined : getEventsProgressively

  return getEventsFunc(filters)
}

export default { getHighlightedFilters, getEvents }
