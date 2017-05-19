import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ScrolledList } from 'kambi-widget-components';
import styles from './MatchOverviewWidget.scss';
import BlendedBackground from './BlendedBackground';
import Event from './Event';
import ArrowButton from './ArrowButton';
import ItemContainer from './ItemContainer';
import TournamentLogo from './TournamentLogo';
import mobile from '../Services/mobile';

/**
 * How long (in milliseconds) to wait before scrolling league logo out
 * @type {number}
 */
const MOBILE_INITIAL_SCROLL_DELAY = 2000;

class MatchOverviewWidget extends Component {

   /**
    * Constructs.
    * @param {object} props Component properties
    */
   constructor(props) {
      super(props);

      this.state = {
         selected: 0
      };
   }

   /**
    * Called after component rendering to DOM.
    */
   componentDidMount() {
      if (mobile()) {
         setTimeout(() => this.setState({ selected: 1 }), MOBILE_INITIAL_SCROLL_DELAY);
      }
   }

   /**
    * Renders component.
    * @returns {XML}
    */
   render() {
      return (
         <div className={styles.widget}>
            <BlendedBackground />
            <ScrolledList
               renderPrevButton={props => <ArrowButton type='left' {...props} />}
               renderNextButton={props => <ArrowButton type='right' {...props} />}
               renderItemContainer={props => <ItemContainer {...props} />}
               selected={this.state.selected}
               scrollToItemMode={ScrolledList.SCROLL_TO_ITEM_MODE.TO_LEFT}
               showControls={!mobile()}
            >
               <TournamentLogo logoClassName={this.props.tournamentLogo} />
               {this.props.events.map(event =>
                  <Event
                     key={event.event.id}
                     event={event.event}
                     liveData={event.liveData}
                     outcomes={event.betOffers.length > 0 ? event.betOffers[0].outcomes : []}
                  />)}
            </ScrolledList>
         </div>
      );
   }

}

MatchOverviewWidget.propTypes = {

   /**
    * Events to display
    */
   events: PropTypes.arrayOf(PropTypes.object).isRequired,

   /**
    * Tournament logo class name.
    */
   tournamentLogo: PropTypes.string

};

MatchOverviewWidget.defaultProps = {
   tournamentLogo: null
};

export default MatchOverviewWidget;
