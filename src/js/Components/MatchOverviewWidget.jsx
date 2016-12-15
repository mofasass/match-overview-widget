import React, { Component, PropTypes } from 'react';
import { ScrolledList } from 'kambi-widget-components';
import styles from './MatchOverviewWidget.scss';
import BlendedBackground from './BlendedBackground';
import Event from './Event';
import ArrowButton from './ArrowButton';
import ItemContainer from './ItemContainer';
import TournamentLogo from './TournamentLogo';

const MatchOverviewWidget = ({ events, tournamentLogo }) => (
   <div className={styles.widget}>
      <BlendedBackground />
      <ScrolledList
         renderPrevButton={props => <ArrowButton type='left' {...props} />}
         renderNextButton={props => <ArrowButton type='right' {...props} />}
         renderItemContainer={props => <ItemContainer {...props} />}
      >
         <TournamentLogo logoClassName={tournamentLogo} />
         {events.map(event =>
            <Event
               key={event.event.id}
               event={event.event}
               liveData={event.liveData}
               outcomes={event.betOffers.length > 0 ? event.betOffers[0].outcomes : []}
            />)}
      </ScrolledList>
   </div>
);

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
