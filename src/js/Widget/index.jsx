import React from 'react'
import ReactDOM from 'react-dom'
import { widgetModule, coreLibrary } from 'kambi-widget-core-library'
import MatchOverviewWidget from '../Components/MatchOverviewWidget'
import kambi from '../Services/kambi'
import live from '../Services/live'
import { supportedSports } from '../constants'

/**
 * Rendered when combined filter is used or there is no current filter.
 * @type {string}
 */
const DEFAULT_TOURNAMENT_LOGO = 'default'

/**
 * Default sport logos used when no icon -> competition match
 * @type {object}
 */
const DEFAULT_LOGOS = {
  football: 'football',
  basketball: 'basketball',
  ice_hockey: 'ice-hockey',
  baseball: 'baseball',
  american_football: 'american-football',
}

/**
 * Handles incoming event's live data update.
 * @param {object} liveEventData Event's live data
 */
const updateLiveEventData = function(liveEventData) {
  const event = this.events.find(event => event.id == liveEventData.eventId)

  if (!event) {
    console.warn(`Live event not found: ${liveEventData.eventId}`)
    return
  }

  event.liveData = liveEventData
}

/**
 * Renders widget within previously defined container (rootEl).
 */
const render = function() {
  ReactDOM.render(
    <MatchOverviewWidget
      events={this.events}
      tournamentLogo={this.tournamentLogo}
    />,
    this.rootEl
  )
}

/**
 * Fetches events based on current filters and sets polling on the live ones.
 * @returns {Promise}
 */
const refreshEvents = function() {
  return kambi
    .getEvents(this.filters, this.combineFilters)
    .then(({ events, filter }) => {
      this.events = events
      this.appliedFilter = filter

      // give up when there is no events
      if (this.events.length == 0) {
        this.onFatal(new Error('No events to show'))
        return
      }

      const liveEvents = this.liveEvents

      // no live events, schedule refresh
      if (liveEvents.length == 0) {
        setTimeout(refreshEvents.bind(this), this.eventsRefreshInterval)
      }

      // subscribe to notifications on live events
      live.subscribeToEvents(
        liveEvents.map(event => event.id),
        liveEventData => {
          updateLiveEventData.call(this, liveEventData)
          render.call(this)
        }, // onUpdate
        refreshEvents // onDrained
      )

      // render fetched events
      render.call(this)
    })
}

class Widget {
  /**
   * Creates new Match Overview widget and manages its lifecycle.
   * @param {string[]} filters Event filters list
   * @param {HTMLElement} [rootEl] Widget's mount point. Defaults to #root
   * @param {boolean} [combineFilters=false] Should filters be combined or checked one after another
   * @param {number} [eventsRefreshInterval=120000] Interval in milliseconds to look for live events (if none are live currently)
   * @param {number} [pollingCount=4] Maximum number of concurrently watched live events
   * @param {function} [onFatal] Fatal error handler
   */
  constructor(
    filters,
    {
      rootEl = coreLibrary.rootElement,
      combineFilters = false,
      eventsRefreshInterval = 120000,
      pollingCount = 4,
      onFatal = e => {
        throw e
      },
    }
  ) {
    this.filters = filters
    this.rootEl = rootEl
    this.combineFilters = combineFilters
    this.eventsRefreshInterval = eventsRefreshInterval
    this.pollingCount = pollingCount
    this.onFatal = onFatal

    this.events = []
    this.appliedFilter = null
  }

  init() {
    widgetModule.setWidgetHeight(150)
    return refreshEvents.call(this)
  }

  /**
   * Filters live events out of current events.
   * @returns {object[]}
   */
  get liveEvents() {
    return this.events.reduce((events, event) => {
      if (events.length >= this.pollingCount) {
        return events
      }

      if (event.tags.indexOf('OPEN_FOR_LIVE') !== -1) {
        events.push(event)
      }

      return events
    }, [])
  }

  /**
   * Returns tournament logo class name based on currently applied filter.
   * @returns {string}
   */
  get tournamentLogo() {
    if (this.combineFilters) {
      return DEFAULT_TOURNAMENT_LOGO
    }

    const customLogoSports = supportedSports.filter(
      sport => sport === 'football'
    )

    const defaultLogoFilters = [
      '/football/usa/mls',
      '/football/england/the_championship',
      '/football/england/league_one',
      '/football/england/league_two',
      "football/euro_2020_qualification",
      "football/uefa_championship_u21",
      "football/copa_america ",
      "football/world_cup__w_",
      "football/euro_2020",
      "football/african_nations_cup",
      "football/copa_libertadores",
      "football/world_cup_2022"
    ]

    const includes = (arr, item) => arr.indexOf(item) !== -1

    const sport = this.appliedFilter
      .split(/\//g)
      .filter(str => str.length > 0)[0]

    if (this.appliedFilter) {
      const customLogoSport = includes(customLogoSports, sport)
      const defaultLogoFilter = includes(defaultLogoFilters, this.appliedFilter)

      if (customLogoSport && !defaultLogoFilter) {
        return this.appliedFilter.substring(1).replace(/\//g, '-')
      }

      return DEFAULT_LOGOS[sport]
    }

    return DEFAULT_TOURNAMENT_LOGO
  }
}

export default Widget
