(function ( Hammer ) {
   'use strict';

   CoreLibrary.SwipeComponent = Stapes.subclass({

      constructor ( container, action, threshold ) {
         var direction = Hammer.DIRECTION_HORIZONTAL;
         action = action || 'Pan';
         this.container = container;
         this.subContainer = container.querySelector('.kw-slider-scroller');
         this.children = this.container.querySelectorAll('.mobile-page');
         this.panes = Array.prototype.slice.call(this.children, 0);
         this.containerSize = this.container[this.dirProp(direction, 'offsetWidth', 'offsetHeight')];
         this.direction = direction;
         this.currentIndex = 0;
         this.navContainer = document.querySelector('.kw-slider-nav');

         this.hammer = new Hammer.Manager(this.container);

         this.recognizer = new Hammer[action]({ direction: this.direction, threshold: threshold });
         this.hammer.add(this.recognizer);
         this.hammer.on('panstart panmove panend pancancel', Hammer.bindFn(this.onPan, this));
         this.show(this.currentIndex);

         setTimeout( () => {
            this.show(1);
         }, 3000);
      },

      dirProp: ( direction, hProp, vProp ) => {
         return (direction && Hammer.DIRECTION_HORIZONTAL) ? hProp : vProp;
      },

      show ( showIndex, percent, animate ) {
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
         this.currentIndex = showIndex;
         this.setTransform(translate);
         this.setActive();
      },

      setActive () {
         this.currentNavPage = document.querySelector('.kw-page-active');
         this.currentNavPage.classList.remove('kw-page-active');
         this.navContainer.children[this.currentIndex].classList.add('kw-page-active');
      },

      setTransform ( translate ) {
         this.subContainer.style.transform = translate;
         this.subContainer.style.mozTransform = translate;
         this.subContainer.style.webkitTransform = translate;
      },

      release () {
         this.hammer.remove(this.recognizer, 'pan');
         this.setTransform('translate3d(0px, 0, 0)');
      },

      attach () {
         this.hammer.add(this.recognizer);
         this.show(this.currentIndex);
      },

      onPan ( ev ) {
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
      }
   });

   return window[Hammer.prefixed(window, 'requestAnimationFrame')] || function ( callback ) {
         setTimeout(callback, 1000 / 60);
      };

})(window.Hammer);
