import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { ScrolledList, BlendedBackground } from 'kambi-widget-components'
import styles from './MatchOverviewWidget.scss'
import Event from './Event'
import ArrowButton from './ArrowButton'
import ItemContainer from './ItemContainer'
import TournamentLogo from './TournamentLogo'
import mobile from '../Services/mobile'

const BG_IMAGE_DESKTOP = 'assets/overview-bw-bg-desktop.jpg'
const BG_IMAGE_MOBILE = 'assets/overview-bw-bg-mobile.jpg'

/**
 * How long (in milliseconds) to wait before scrolling league logo out
 * @type {number}
 */
const MOBILE_INITIAL_SCROLL_DELAY = 2000

class MatchOverviewWidget extends Component {
  /**
   * Constructs.
   * @param {object} props Component properties
   */
  constructor(props) {
    super(props)

    this.state = {
      selected: 0,
    }
  }

  /**
   * Called after component rendering to DOM.
   */
  componentDidMount() {
    if (mobile()) {
      setTimeout(
        () => this.setState({ selected: 1 }),
        MOBILE_INITIAL_SCROLL_DELAY
      )
    }
  }

  /**
   * Renders component.
   * @returns {XML}
   */
  render() {
    let blendWithOperatorColor = true
    let backgroundUrl
    if (this.props.backgroundUrl) {
      backgroundUrl = this.props.backgroundUrl
      blendWithOperatorColor = false
    } else if (mobile()) {
      backgroundUrl = BG_IMAGE_MOBILE
    } else {
      backgroundUrl = BG_IMAGE_DESKTOP
    }

    return (
      <div className={styles.widget}>
        <BlendedBackground
          backgroundUrl={backgroundUrl}
          blendWithOperatorColor={blendWithOperatorColor}
        />
        <ScrolledList
          renderPrevButton={props => <ArrowButton type="left" {...props} />}
          renderNextButton={props => <ArrowButton type="right" {...props} />}
          renderItemContainer={props => <ItemContainer {...props} />}
          selected={this.state.selected}
          scrollToItemMode={ScrolledList.SCROLL_TO_ITEM_MODE.TO_LEFT}
          showControls={!mobile()}
        >
          <TournamentLogo iconUrl={this.props.iconUrl} />
          {this.props.events
            .filter(event => event.betOffers.length > 0)
            .map(event => {
              return (
                <Event
                  key={event.event.id}
                  event={event.event}
                  liveData={event.liveData}
                  outcomes={event.betOffers[0].outcomes}
                  highlightBasedOnBetslip={this.props.highlightBasedOnBetslip}
                />
              )
            })}
        </ScrolledList>
      </div>
    )
  }
}

MatchOverviewWidget.propTypes = {
  /**
   * Events to display
   */
  events: PropTypes.arrayOf(PropTypes.object).isRequired,

  /**
   * If false OutcomeButtons won't become selected
   */
  highlightBasedOnBetslip: PropTypes.bool,

  /**
   * Url of the background
   */
  backgroundUrl: PropTypes.string,

  /**
   * Url of the background
   */
  iconUrl: PropTypes.string,
}

MatchOverviewWidget.defaultProps = {
  tournamentLogo: null,
  backgroundUrl: null,
  iconUrl: null,
  highlightBasedOnBetslip: true,
}

export default MatchOverviewWidget
