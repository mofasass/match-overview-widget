import React from 'react'
import PropTypes from 'prop-types'
import styles from './TournamentLogo.scss'

const TournamentLogo = ({ iconUrl, scrolledListHasHorizontalSpaceLeft }) => {
  let className = styles.general
  if (scrolledListHasHorizontalSpaceLeft) {
    className += ' ' + styles.scrolledListHasHorizontalSpaceLeft
  }
  return (
    <div className={className}>
      <i
        className="kw-custom-logo-large-type"
        style={{
          backgroundImage: `url(${iconUrl})`,
        }}
      />
    </div>
  )
}

TournamentLogo.propTypes = {
  /**
   * Logo CSS class name.
   * These classes are defined in operator-specific CSS file.
   */
  iconUrl: PropTypes.string,
}

TournamentLogo.defaultProps = {
  iconUrl: 'assets/icons/football.svg',
}

export default TournamentLogo
