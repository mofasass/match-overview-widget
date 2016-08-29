(() => {
   'use strict';

   CoreLibrary.ScrollComponent = Stapes.subclass({

      constructor ( parentScope ) {
         this.parentScope = parentScope;
         this.scrollStart = 0;
         this.scrollerLogoWidth = parentScope.logoWidth || 90;
         this.onResize = this.onResize.bind(this);
         this.onScroll = this.doScroll;
         this.getScroller();
      },

      scrollPastLogo () {
         var start = null,
            step = ( timestamp ) => {
               if ( !start ) {
                  start = timestamp;
               }
               var progress = timestamp - start;
               this.scroller.scrollLeft = Math.min(progress / 2, this.scrollerLogoWidth);
               if ( progress < this.scrollerLogoWidth * 2 ) {
                  window.requestAnimationFrame(step);
               }
            };
         window.requestAnimationFrame(step);
      },

      getScroller () {
         this.scrollerContainer = document.getElementById('match-schedule');
         this.scroller = document.getElementById('kw-scroll-component');
         this.items = this.scroller.querySelectorAll('.kw-item');
         this.itemWidth = 350;
         this.scrollerLogo = document.getElementById('kw-scroller-logo') ? this.scrollerLogoWidth : 0;
         this.scrollerWidth = this.itemWidth * this.items.length + this.scrollerLogo;
         this.scrollerParent = this.scroller.parentElement;
         this.scrollerParentWidth = this.scrollerParent.offsetWidth;
         this.enabled = this.scrollerWidth >= this.scrollerParentWidth;
         this.scrollerContainer.classList.remove('kw-no-gradient');
         if ( !this.enabled ) {
            this.scrollerContainer.classList.add('kw-no-gradient');
            this.scrollStart = 0;
            this.doTranslate();
            this.handleClass('left', true);
         }
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
         if ( !this.scope.enabled ) {
            return false;
         }
         var dir = this.getAttribute('data-dir');
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
         this.scope.doTranslate();
      },

      doTranslate () {
         var translate = 'translate3d(' + this.scrollStart + 'px, 0, 0)';
         this.scroller.style.transform = translate;
         this.scroller.style.webkitTransform = translate;
         this.scroller.style.MozTransform = translate;
      },

      onResize () {
         this.getScroller();
      }
   });

})();
