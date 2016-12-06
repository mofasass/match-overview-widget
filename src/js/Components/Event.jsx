import React, { Component, PropTypes } from 'react';
import { translationModule } from 'kambi-widget-core-library';
import { OutcomeButton, OutcomeButtonUI } from 'kambi-widget-components';
import styles from './Event.scss';

const t = translationModule.getTranslation.bind(translationModule);

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

class Event extends Component {

   /**
    * Formatted start date.
    * @returns {string}
    */
   get startDate() {
      const now = new Date(),
         date = new Date(this.props.event.start);

      return t(
            (now.getDate() === date.getDate() ? 'today'
               : (now.getDate() === date.getDate() - 1 ? 'tomorrow' : ''))
         ) + ' ' +
         pad(date.getDate()) + ' ' +
         // @todo: add translations for months
         cap(t('month' + date.getMonth()).slice(0, 3)) + ' ' +
         pad(date.getHours()) + ':' +
         pad(date.getMinutes());
   }

   /**
    * Renders component.
    * @returns {XML}
    */
   render() {
      return (
         <div className={styles.general}>
            <div className={styles.header}>
               <div className={styles.group}>{this.props.event.group}</div>
               <div className={styles.start}>{this.startDate}&nbsp;</div>
            </div>
            <div className={styles.teams}>
               <div className={[styles.team, 'home'].join(' ')}>
                  {(this.props.event.homeFlag) &&
                     <img className='flag' src={this.props.event.homeFlag.url} alt='' />}
                  <span className='name'>{this.props.event.homeName}</span>
               </div>

               {this.props.event.liveData &&
                  <div className={styles.score}>
                     {this.props.event.liveData.score.home}
                     <small>-</small>
                     {this.props.event.liveData.score.away}
                  </div>}

               <div className={[styles.team, 'away'].join(' ')}>
                  <span className='name'>{this.props.event.awayName}</span>
                  {(this.props.event.awayFlag) &&
                     <img className='flag' src={this.props.event.awayFlag.url} alt='' />}
               </div>
            </div>
            <div className={`${styles.outcomes}`}>
               {!this.props.event.liveData &&
                  this.props.outcomes.map(outcome => <OutcomeButton key={outcome.id} outcome={outcome} event={this.props.event} />)}

               {this.props.event.liveData &&
                  <OutcomeButtonUI
                     label={<span className={styles.liveLabel}><em>{t('Live')}</em>{t('Right Now')}</span>}
                     onClick={null}
                  />}
            </div>
         </div>
      );
   }
}

Event.propTypes = {
   /**
    * Event object
    */
   event: PropTypes.object.isRequired,

   /**
    * Array of outcomes
    */
   outcomes: PropTypes.array
};

Event.defaultProps = {
   outcomes: []
};

export default Event;
