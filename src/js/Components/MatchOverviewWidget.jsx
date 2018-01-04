import React, { Component } from 'react';
import { widgetModule, coreLibrary } from 'kambi-widget-core-library';
import PropTypes from 'prop-types';
import { ScrolledList } from 'kambi-widget-components';
import kambi from '../Services/kambi';
import live from '../Services/live';
import styles from './MatchOverviewWidget.scss';

import BlendedBackground from './BlendedBackground';
import Event from './Event';
import ArrowButton from './ArrowButton';
import ItemContainer from './ItemContainer';
import TournamentLogo from './TournamentLogo';

import mobile from '../Services/mobile';

/**
 * Rendered when combined filter is used or there is no current filter.
 * @type {string}
 */
const DEFAULT_TOURNAMENT_LOGO = 'football';

/**
 * How long (in milliseconds) to wait before scrolling league logo out
 * @type {number}
 */
const MOBILE_INITIAL_SCROLL_DELAY = 2000;

class MatchOverviewWidget extends Component {

   constructor(props) {
      super(props);

      this.state = {
         selected: 0,
         events: [],
         tournamentLogo: null,
         appliedFilter: null,
      };
   }


   componentWillMount() {
      widgetModule.setWidgetHeight(0)
      const events = this.getEvents().then(({ events, filter }) => {
         const tournamentLogo = this.tournamentLogo(filter)
         this.setState({ events, appliedFilter: filter, tournamentLogo })
         widgetModule.setWidgetHeight(150)
      })
   }


   /**
    * Called after component rendering to DOM.
    */
   componentDidMount() {
      if (mobile()) {
         setTimeout(() => this.setState({ selected: 1 }), MOBILE_INITIAL_SCROLL_DELAY);
      }
   }

   getFilters() {
      return new Promise((resolve) => {
         this.props.compareAgainstHighlights // set this arg to false to test specific filters
            ? kambi.getHighlightedFilters(this.props.filter)
               .then((filters) => resolve(filters))
            : resolve(this.props.filter);
      })
   }

   getEvents() {
      return this.getFilters().then((filters) => {
         return kambi.getEvents(filters, this.props.combineFilters)
            .then(({ events, filter }) => {

               // give up when there is no events
               if (events.length == 0) {
                  this.props.onFatal(new Error('No events to show'));
                  return;
               }

               const liveEvents = this.liveEvents
               // no live events, schedule refresh
               if (liveEvents.length == 0) {
                  setTimeout(
                     this.getEvents.bind(this),
                     this.props.eventsRefreshInterval
                  );
               }

               // subscribe to notifications on live events
               live.subscribeToEvents(
                  liveEvents.map(event => event.event.id),
                  (liveEventData) => {
                     this.updateLiveEventData.call(this, liveEventData);
                     return { events, filter }
                  }, // onUpdate
                  this.getEvents.bind(this) // onDrained
               );

               return { events, filter }
            })
      })
   }

   /**
    * Handles incoming event's live data update.
    * @param {object} liveEventData Event's live data
    */
   updateLiveEventData(liveEventData) {
      const event = this.state.events.find(event => event.event.id == liveEventData.eventId);

      if (!event) {
         console.warn(`Live event not found: ${liveEventData.eventId}`);
         return;
      }

      event.liveData = liveEventData;
   }

   /**
    * Filters live events out of current events.
    * @returns {object[]}
    */
   get liveEvents() {
      return this.state.events.reduce((events, event) => {
         if (events.length >= this.props.pollingCount) {
            return events;
         }

         if (event.event.openForLiveBetting === true) {
            events.push(event);
         }

         return events;
      }, []);
   }

   /**
    * Returns tournament logo class name based on currently applied filter.
    * @returns {string}
    */
   tournamentLogo(filter) {
      if (this.props.combineFilters) {
         return DEFAULT_TOURNAMENT_LOGO;
      }

      return filter ? filter.substring(1).replace(/\//g, '-')
         : DEFAULT_TOURNAMENT_LOGO;
   }

   /**
    * Renders component.
    * @returns {XML}
    */
   render() {
      const { events, selected, tournamentLogo } = this.state

      return (
         <div className={styles.widget}>
            <BlendedBackground />
            {events.length > 0 && <ScrolledList
               renderPrevButton={props => <ArrowButton type='left' {...props} />}
               renderNextButton={props => <ArrowButton type='right' {...props} />}
               renderItemContainer={props => <ItemContainer {...props} />}
               selected={selected}
               scrollToItemMode={ScrolledList.SCROLL_TO_ITEM_MODE.TO_LEFT}
               showControls={!mobile()}
            >
               {tournamentLogo != null && <TournamentLogo logoName={tournamentLogo} />}
               {events
                  .filter(event => event.betOffers.length > 0)
                  .map((event) => {
                     return (
                        <Event
                           key={event.event.id}
                           event={event.event}
                           liveData={event.liveData}
                           outcomes={event.betOffers[0].outcomes}
                        />
                     )
                  })}
            </ScrolledList>}
         </div>
      );
   }

}

MatchOverviewWidget.propTypes = {
   /**
    * Tournament logo class name.
    */
   tournamentLogo: PropTypes.string,

   onFatal: PropTypes.func,


};

export default MatchOverviewWidget;
