import React, { PropTypes } from 'react';
import styles from './BlendedBackground.scss';

const BlendedBackground = () => (
   <svg xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink' className={styles.background}>
      <defs>
         <filter id='filter'>
            <feImage
               id='background-image' /* @todo: replace with ref */
               xlinkHref='src/custom/overview-bw-bg-desktop.jpg'
               result='slide2'
               x='0'
               y='0'
               width='100%'
               preserveAspectRatio='xMidYMid slice'
            />
            <feBlend in2='SourceGraphic' in='slide2' mode='multiply' />
         </filter>
      </defs>
      <rect id='blendRect' x='0' y='0' filter='url(#filter)' width='100%' height='100%' />
   </svg>
);

BlendedBackground.propTypes = {
};

export default BlendedBackground;
