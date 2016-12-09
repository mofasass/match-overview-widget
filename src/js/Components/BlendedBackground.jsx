import React, { Component, PropTypes } from 'react';
import mobile from '../Service/mobile';
import styles from './BlendedBackground.scss';

/**
 * Desktop background file path
 * @type {string}
 */
const BG_IMAGE_DESKTOP = 'src/custom/overview-bw-bg-desktop.jpg';

/**
 * Mobile background file path
 * @type {string}
 */
const BG_IMAGE_MOBILE = 'src/custom/overview-bw-bg-mobile.jpg';

/**
 * Displays a background image which is blended with actual operator's color theme.
 */
class BlendedBackground extends Component {

   /**
    * Constructs.
    * @param props
    */
   constructor(props) {
      super(props);
      this.state = { mobile: mobile() };
      this.onResize = this.onResize.bind(this);
   }

   /**
    * Called after component mounting.
    */
   componentDidMount() {
      window.addEventListener('resize', this.onResize);
   }

   /**
    * Called just before component unmounting.
    */
   componentWillUnmount() {
      window.removeEventListener('resize', this.onResize);
   }

   /**
    * Handles window resize.
    */
   onResize() {
      if (mobile() != this.state.mobile) {
         this.setState({ mobile: !this.state.mobile });
      }
   }

   /**
    * Renders component.
    * @returns {XML}
    */
   render() {
      return (
         <svg xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink' className={styles.background}>
            <defs>
               <filter id='filter'>
                  <feImage
                     result='slide2'
                     x='0'
                     y='0'
                     width='100%'
                     preserveAspectRatio='xMidYMid slice'
                     xlinkHref={this.state.mobile ? BG_IMAGE_MOBILE : BG_IMAGE_DESKTOP}
                  />
                  <feBlend in2='SourceGraphic' in='slide2' mode='multiply' />
               </filter>
            </defs>
            <rect id='blendRect' x='0' y='0' filter='url(#filter)' width='100%' height='100%' />
         </svg>
      );
   }
}

export default BlendedBackground;
