import React from 'react';
import PropTypes from 'prop-types';
import styles from './TournamentLogo.scss';

const TournamentLogo = ({ logoClassName }) => (
   <div className={[styles.general, logoClassName].join(' ')}>
      <i className='kw-custom-logo-large-type' />
   </div>
);

TournamentLogo.propTypes = {
   /**
    * Logo CSS class name.
    * These classes are defined in operator-specific CSS file.
    */
   logoClassName: PropTypes.string
};

TournamentLogo.defaultProps = {
   logoClassName: 'combined-filters'
};

export default TournamentLogo;
