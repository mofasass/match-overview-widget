(() => {
   'use strict';

   CoreLibrary.ScrollComponent = Stapes.subclass({

      constructor ( parentScope ) {
         this.parentScope = parentScope;
         this.scrollStart = 0;
         this.offline_interval = this.parentScope.offline_interval;
         this.onResize = this.onResize.bind(this);
         this.onScroll = this.doScroll;
         this.getScroller();
      },

      scrollPastLogo () {
         var start = null;
         var step = function ( timestamp ) {
            if ( !start ) {
               start = timestamp;
            }
            var progress = timestamp - start;
            this.scroller.scrollLeft = Math.min(progress / 2 , 90);
            if ( progress < 180 ) {
               window.requestAnimationFrame(step);
            }
         }.bind(this);
         window.requestAnimationFrame(step);
      },

      getScroller () {
         this.scrollerContainer = document.getElementById('live-upcoming');
         this.scroller = document.getElementById('kw-slider-bottom');
         this.events = this.scroller.querySelectorAll('.kw-match');
         this.itemWidth = 350;
         this.offline_interval = this.offline_interval ? 90 : 0;
         this.scrollerWidth = this.itemWidth * this.events.length + this.offline_interval;
         this.scrollerParent = this.scroller.parentElement;
         this.scrollerParentWidth = this.scrollerParent.offsetWidth;
      },

      handleClass ( dir, end ) {
         this.scrollerContainer.classList.remove('kw-gradient-right');
         this.scrollerContainer.classList.remove('kw-gradient-left');
         if ( dir === 'right' && end ) {
            this.scrollerContainer.classList.add('kw-gradient-right');
         } else if ( dir === 'left' && end ) {
            this.scrollerContainer.classList.add('kw-gradient-left');
         }
      },

      doScroll ( elem, scope ) {
         this.scope = scope.scroller;
         var dir = this.getAttribute('data-dir'), translate;
         this.scope.handleClass(dir);

         if ( dir === 'left' ) {
            this.scope.scrollStart += this.scope.itemWidth;
         } else {
            this.scope.scrollStart -= this.scope.itemWidth;
         }
         if ( this.scope.scrollStart >= 0 ) {
            this.scope.scrollStart = 0;
            this.scope.handleClass(dir, true);
         }
         if ( (this.scope.scrollStart * -1) >= (this.scope.scrollerWidth - this.scope.scrollerParentWidth) ) {
            this.scope.scrollStart = (this.scope.scrollerWidth - this.scope.scrollerParentWidth) * -1;
            this.scope.handleClass(dir, true);
         }
         translate = 'translate3d(' + this.scope.scrollStart + 'px, 0, 0)';

         this.scope.scroller.style.transform = translate;
         this.scope.scroller.style.webkitTransform = translate;
         this.scope.scroller.style.MozTransform = translate;
      },

      onResize () {
         this.getScroller();
      }
   });

})();
