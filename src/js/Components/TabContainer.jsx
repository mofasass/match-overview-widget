import React, { PropTypes } from 'react';
import styles from './TabContainer.scss';

/**
 * Returns DOM element's width (in pixels)
 * @param {HTMLElement} el DOM element
 * @returns number|null
 */
const getWidth = function(el) {
   return el ? el.offsetWidth : null;
};

const TabContainer = ({ children, selected, onClick, onWidth }) => (
   <div
      className={styles.tab}
      onClick={onClick}
      ref={onWidth ? el => onWidth(getWidth(el)) : undefined}
   >
      {children}
   </div>
);

TabContainer.propTypes = {
   /**
    * On click handler
    */
   onClick: PropTypes.func,

   /**
    * Is this tab currently selected?
    */
   selected: PropTypes.bool,

   /**
    * Tab contents
    */
   children: PropTypes.node,

   /**
    * Called when tab width is known
    */
   onWidth: PropTypes.func
};

export default TabContainer;
