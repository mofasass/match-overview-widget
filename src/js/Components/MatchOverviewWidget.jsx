import React, { Component, PropTypes } from 'react';
import { TabBarScrolled } from 'kambi-widget-components';
import store from '../Store/store';
import live from '../Store/live';
import styles from './MatchOverviewWidget.scss';
import Event from './Event';
import ArrowButton from './ArrowButton';
import TabContainer from './TabContainer';
import TournamentLogo from './TournamentLogo';

class MatchOverviewWidget extends Component {

   /**
    * Widget constructor
    * @param {object} props Widget properties
    */
   constructor(props) {
      super(props);

      this.state = {
         events: [],
         appliedFilter: ''
      };
   }

   /**
    * Called after mounting widget.
    */
   componentDidMount() {
      this.refreshEvents();
   }

   onLiveEventData(liveEventData) {
      const event = this.state.events.find(event => event.event.id == liveEventData.eventId);

      if (!event) {
         console.warn(`Live event not found: ${liveEventData.eventId}`);
         return;
      }

      event.liveData = liveEventData;
   }

   get liveEvents() {
      return this.state.events.reduce((events, event) => {
         if (events.length >= this.props.liveEventsLimit) {
            return events;
         }

         if (event.event.openForLiveBetting === true) {
            events.push(event);
         }

         return events;
      }, []);
   }

   refreshEvents() {
      return store.getEvents(this.props.filters, this.props.combineFilters)
         .then((result) => {
            // update internal state

            this.setState({
               events: result.events,
               appliedFilter: result.filter
            });
         })
         .then(() => {
            const liveEvents = this.liveEvents;

            if (liveEvents.length == 0) {
               setTimeout(this.refreshEvents.bind(this), this.props.eventsRefreshInterval);
            }

            // subscribe to notifications on live events
            live.subscribeToEvents(
               liveEvents.map(event => event.event.id),
               this.onLiveEventData.bind(this),
               this.refreshEvents.bind(this)
            );
         });
   }

   /**
    * Renders widget.
    * @returns {XML}
    */
   render() {
      return (
         <div className={styles.widget}>
            <svg xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink' className={styles.background}>
               <defs>
                  <filter id='myFilter'>
                     <feImage
                        id='background-image'
                        xlinkHref='src/custom/overview-bw-bg-desktop.jpg'
                        result='slide2'
                        x='0'
                        y='0'
                        width='100%'
                        preserveAspectRatio='xMidYMid slice'
                     />
                     <feBlend in2='SourceGraphic' in='slide2' mode='multiply' />
                  </filter>
               </defs>
               <rect id='blendRect' x='0' y='0' filter='url(#myFilter)' width='100%' height='100%' />
            </svg>
            <TabBarScrolled
               renderPrevButton={props => <ArrowButton type='left' {...props} />}
               renderNextButton={props => <ArrowButton type='right' {...props} />}
               renderTabContainer={props => <TabContainer {...props} />}
            >
               <TournamentLogo filter={this.props.combineFilters ? null : this.state.appliedFilter} />
               {this.state.events.map(event => <Event key={event.event.id} event={event} />)}
            </TabBarScrolled>
         </div>
      );
   }
}

MatchOverviewWidget.propTypes = {
   filters: PropTypes.arrayOf(PropTypes.string),
   combineFilters: PropTypes.bool,
   liveEventsLimit: PropTypes.number,
   eventsRefreshInterval: PropTypes.number
};

MatchOverviewWidget.defaultProps = {
   combineFilters: false,
   liveEventsLimit: 4,
   eventsRefreshInterval: 120000
};

export default MatchOverviewWidget;
