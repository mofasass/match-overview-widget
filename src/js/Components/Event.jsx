import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { translationModule, widgetModule } from 'kambi-widget-core-library'
import { OutcomeButton, OutcomeButtonUI } from 'kambi-widget-components'
import styles from './Event.scss'

/**
 * Translation helper
 * @type {function}
 */
const t = translationModule.getTranslation.bind(translationModule)

/**
 * Pads with leading 0s to ensure number is two digit.
 * @param {number} n Number to pad
 */
const pad = function(n) {
  return n < 10 ? '0' + n : n
}

/**
 * Capitalizes first letter of a string.
 * @param {string} s Given string
 */
const cap = function(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

class Event extends Component {
  /**
   * Constructs.
   * @param {object} props Component properties
   */
  constructor(props) {
    super(props)
    this.onClick = this.onClick.bind(this)
  }

  /**
   * Handles click on event box.
   */
  onClick() {
    if (this.props.event.tags.indexOf('OPEN_FOR_LIVE') !== -1) {
      widgetModule.navigateToLiveEvent(this.props.event.id)
    } else {
      widgetModule.navigateToEvent(this.props.event.id)
    }
  }

  /**
   * Formatted start date.
   * @returns {string}
   */
  get startDate() {
    const now = new Date(),
      date = new Date(this.props.event.start)

    const soonStr = (function() {
      if (now.getDate() === date.getDate()) {
        return t('today')
      } else if (now.getDate() === date.getDate() - 1) {
        return t('tomorrow')
      } else {
        return ''
      }
    })()

    return (
      soonStr +
      ' ' +
      pad(date.getDate()) +
      ' ' +
      // @todo: add translations for months
      cap(t('month' + date.getMonth()).slice(0, 3)) +
      ' ' +
      pad(date.getHours()) +
      ':' +
      pad(date.getMinutes())
    )
  }

  sortOutcomes(outcomes) {
    let sorting = ['OT_ONE', 'OT_CROSS', 'OT_TWO']
    const byType = (a, b) => sorting.indexOf(a.type) - sorting.indexOf(b.type)
    if (this.americanDisplayFormat) sorting = sorting.reverse()

    return [...outcomes].sort(byType)
  }

  // AMERICAN_DISPLAY_FORMAT means the match should show awayName first
  // it is usually only used for american football
  get americanDisplayFormat() {
    return this.props.event.tags.indexOf('AMERICAN_DISPLAY_FORMAT') !== -1
  }

  get outcomes() {
    const { outcomes } = this.props
    return this.sortOutcomes(outcomes)
  }

  /**
   * Renders component.
   * @returns {XML}
   */
  render() {
    const homeName = (
      <div
        className={[
          styles.team,
          this.americanDisplayFormat ? styles.right : styles.left,
        ].join(' ')}
      >
        {this.props.event.homeFlag && (
          <img
            className={styles.flag}
            src={this.props.event.homeFlag.url}
            alt=""
          />
        )}
        <span className={styles.name}>{this.props.event.homeName}</span>
      </div>
    )

    const awayName = (
      <div
        className={[
          styles.team,
          this.americanDisplayFormat ? styles.left : styles.right,
        ].join(' ')}
      >
        <span className={styles.name}>{this.props.event.awayName}</span>
        {this.props.event.awayFlag && (
          <img
            className={styles.flag}
            src={this.props.event.awayFlag.url}
            alt=""
          />
        )}
      </div>
    )

    const score = this.props.liveData ? this.props.liveData.score : null
    return (
      <div className={styles.general}>
        <div className={styles.header} onClick={this.onClick}>
          <div className={styles.group}>{this.props.event.group}</div>
          <div className={styles.start}>{this.startDate}&nbsp;</div>
        </div>
        <div className={styles.teams} onClick={this.onClick}>
          {this.americanDisplayFormat ? awayName : homeName}

          {this.props.liveData && (
            <div className={styles.score}>
              {this.americanDisplayFormat ? score.away : score.home}
              <small>-</small>
              {this.americanDisplayFormat ? score.home : score.away}
            </div>
          )}

          {this.americanDisplayFormat ? homeName : awayName}
        </div>
        <div className={`${styles.outcomes}`}>
          {!this.props.liveData &&
            this.outcomes.map(outcome => (
              <OutcomeButton
                key={outcome.id}
                outcome={outcome}
                event={this.props.event}
                updateOdds={false}
              />
            ))}

          {this.props.liveData && (
            <OutcomeButtonUI
              label={
                <span className={styles.liveLabel}>
                  <em>{t('Live')}</em>
                  {t('Right Now')}
                </span>
              }
              onClick={this.onClick}
            />
          )}
        </div>
      </div>
    )
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
  outcomes: PropTypes.array,

  /**
   * Live data object
   */
  liveData: PropTypes.object,
}

Event.defaultProps = {
  outcomes: [],
  liveData: null,
}

export default Event
