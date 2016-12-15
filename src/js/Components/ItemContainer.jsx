import React, { PropTypes } from 'react';
import styles from './ItemContainer.scss';

/**
 * Returns DOM element's width (in pixels)
 * @param {HTMLElement} el DOM element
 * @returns number|null
 */
const getWidth = function(el) {
   return el ? el.offsetWidth : null;
};

const ItemContainer = ({ children, selected, onClick, onWidth }) => (
   // onClick is not wired in order to disable scroll on click

   <div
      className={styles.item}
      ref={onWidth ? el => onWidth(getWidth(el)) : undefined}
   >
      {children}
   </div>
);

ItemContainer.propTypes = {
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

export default ItemContainer;
