import React, { PropTypes } from 'react';
import { translationModule } from 'kambi-widget-core-library';
import { OutcomeButton } from 'kambi-widget-components';
import styles from './Event.scss';

/**
 * Pads with leading 0s to ensure number is two digit.
 * @param {number} n Number to pad
 */
const pad = function(n) {
   return n < 10 ? '0' + n : n;
};

/**
 * Capitalizes first letter of a string.
 * @param {string} s Given string
 */
const cap = function(s) {
   return s.charAt(0).toUpperCase() + s.slice(1);
};

const getFormattedDate = function(date) {
   const t = translationModule.getTranslation.bind(translationModule),
      now = new Date();

   return t(
         (now.getDate() === date.getDate() ? 'today'
            : (now.getDate() === date.getDate() - 1 ? 'tomorrow' : ''))
      ) + ' ' +
      pad(date.getDate()) + ' ' +
      // @todo: add translations for months
      cap(t('month' + date.getMonth()).slice(0, 3)) + ' ' +
      pad(date.getHours()) + ':' +
      pad(date.getMinutes());
};

const Event = ({ event }) => {
   return (
      <div className={styles.general}>
         <div className={styles.header}>
            <div className={styles.group}>{event.event.group}</div>
            <div className={styles.start}>{getFormattedDate(new Date(event.event.start))}&nbsp;</div>
         </div>
         <div className={styles.teams}>
            <div className={[styles.team, 'home'].join(' ')}>
               {event.event.homeFlag &&
                  <img className={styles.flag} src={event.event.homeFlag.url} alt='' />}
               <span className='name'>{event.event.homeName}</span>
               <span style={{ flex: 1 }} />
            </div>
            <div className={[styles.team, 'away'].join(' ')}>
               <span style={{ flex: 1 }} />
               <span className='name'>{event.event.awayName}</span>
               {event.event.awayFlag &&
                  <img className={styles.flag} src={event.event.awayFlag.url} alt='' />}
            </div>
         </div>
         {event.betOffers && !event.liveData &&
            <div className={styles.outcomes}>
               {event.betOffers[0].outcomes.map(outcome =>
                  <OutcomeButton key={outcome.id} outcome={outcome} event={event.event} />)}
            </div>}
      </div>
   );
};

Event.propTypes = {
   event: PropTypes.object.isRequired
};

export default Event;
