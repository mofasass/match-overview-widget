import React from 'react';
import PropTypes from 'prop-types';
import styles from './TournamentLogo.scss';

const TournamentLogo = ({ logoName }) => {
   return (
      <div className={styles.general}>
         <i
            className='kw-custom-logo-large-type'
            style={{
               backgroundImage: `url(assets/icons/${logoName}.svg)`
            }}
         />
      </div>
   );
}

TournamentLogo.propTypes = {
   /**
    * Logo CSS class name.
    * These classes are defined in operator-specific CSS file.
    */
   logoName: PropTypes.string
};

TournamentLogo.defaultProps = {
   logoName: 'football'
};

export default TournamentLogo;
