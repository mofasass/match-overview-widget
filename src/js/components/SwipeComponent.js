(function ( Hammer ) {
   'use strict';

   CoreLibrary.SwipeComponent = Stapes.subclass({

      constructor: function ( container ) {
         var direction = Hammer.DIRECTION_HORIZONTAL;
         this.container = container;
         this.subContainer = container.children[0];
         this.children = document.querySelectorAll('.mobile-page');
         this.panes = Array.prototype.slice.call(this.children, 0);
         this.containerSize = this.container[this.dirProp(direction, 'offsetWidth', 'offsetHeight')];
         this.direction = direction;

         this.currentIndex = 0;

         this.recognizer = new Hammer.Pan({ direction: this.direction, threshold: 0 });

         this.hammer = new Hammer.Manager(this.container);
         this.hammer.add(this.recognizer);
         this.hammer.on('panstart panmove panend pancancel', Hammer.bindFn(this.onPan, this));

         this.show(this.currentIndex);
      },

      dirProp: ( direction, hProp, vProp ) => {
         return (direction && Hammer.DIRECTION_HORIZONTAL) ? hProp : vProp;
      },

      show: function ( showIndex, percent, animate ) {
         showIndex = Math.max(0, Math.min(showIndex, Math.floor((this.panes.length - 1))));
         percent = percent || 0;

         var className = this.container.className, pos, translate;

         if ( animate ) {
            if ( className.indexOf('animate') === -1 ) {
               this.container.className += ' animate';
            }
         } else {
            if ( className.indexOf('animate') !== -1 ) {
               this.container.className = className.replace('animate', '').trim();
            }
         }
         pos = (this.containerSize / 100 ) * ((showIndex * 100 * -1) + percent);
         translate = 'translate3d(' + pos + 'px, 0, 0)';
         this.setTransform(translate);
         this.currentIndex = showIndex;
      },

      setTransform: function ( translate ) {
         this.subContainer.style.transform = translate;
         this.subContainer.style.mozTransform = translate;
         this.subContainer.style.webkitTransform = translate;
      },

      release: function () {
         this.hammer.remove(this.recognizer, 'pan');
         this.setTransform('translate3d(0px, 0, 0)');
      },

      attach: function () {
         this.hammer.add(this.recognizer);
         this.show(this.currentIndex);
      },

      onPan: function ( ev ) {
         var delta = this.dirProp(this.direction, ev.deltaX, ev.deltaY);
         var percent = (100 / this.containerSize) * delta;
         var animate = false;

         if ( ev.type === 'panend' || ev.type === 'pancancel' ) {
            if ( Math.abs(percent) > 20 && ev.type === 'panend' ) {
               this.currentIndex += (percent < 0) ? 1 : -1;
            }
            percent = 0;
            animate = true;
         }

         this.show(this.currentIndex, percent, animate);
      },

      init: function () {
      }
   });

   return window[Hammer.prefixed(window, 'requestAnimationFrame')] || function ( callback ) {
         setTimeout(callback, 1000 / 60);
      };

})(window.Hammer);
