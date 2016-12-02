import React, { PropTypes } from 'react';
import styles from './TournamentLogo.scss';

const TournamentLogo = ({ filter }) => {
   const logoClassName = filter ? filter.substring(1).replace(/\//g, '-')
      : 'combined-filters';

   return (
      <div className={[styles.general, logoClassName].join(' ')}>
         <i className='kw-custom-logo-large-type' />
      </div>
   );
};

TournamentLogo.propTypes = {
   /**
    * Logo name
    */
   filter: PropTypes.string
};

export default TournamentLogo;
