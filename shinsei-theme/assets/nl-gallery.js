/* nl-gallery: position counter, arrow-key navigation and a screen-reader
 * announcement for the Gallery block. Swiping itself is CSS scroll snap.
 */
(() => {
  if (customElements.get('nl-gallery')) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  class NlGallery extends HTMLElement {
    connectedCallback() {
      this.track = this.querySelector('.nl-gallery__track');
      this.slides = [...this.querySelectorAll('.nl-gallery__slide')];
      this.current = this.querySelector('[data-current]');
      this.status = this.querySelector('[data-status]');
      if (!this.track || this.slides.length < 2) return;

      this.index = 0;
      this.frame = null;
      this.onScroll = () => {
        if (this.frame) return;
        this.frame = requestAnimationFrame(() => {
          this.frame = null;
          this.update();
        });
      };
      this.onKeydown = (event) => {
        if (!this.isSwiping()) return;
        if (event.key === 'ArrowRight') this.go(this.index + 1, event);
        if (event.key === 'ArrowLeft') this.go(this.index - 1, event);
      };

      this.track.addEventListener('scroll', this.onScroll, { passive: true });
      this.track.addEventListener('keydown', this.onKeydown);
    }

    disconnectedCallback() {
      if (!this.track) return;
      this.track.removeEventListener('scroll', this.onScroll);
      this.track.removeEventListener('keydown', this.onKeydown);
      if (this.frame) cancelAnimationFrame(this.frame);
    }

    // True when the track scrolls sideways (swipe layout, or mobile in responsive)
    isSwiping() {
      return this.track.scrollWidth > this.track.clientWidth + 1;
    }

    go(index, event) {
      const next = Math.max(0, Math.min(this.slides.length - 1, index));
      if (next === this.index) return;
      event.preventDefault();
      this.track.scrollTo({
        left: next * this.track.clientWidth,
        behavior: reducedMotion.matches ? 'auto' : 'smooth',
      });
    }

    update() {
      const width = this.track.clientWidth || 1;
      const index = Math.max(0, Math.min(this.slides.length - 1, Math.round(this.track.scrollLeft / width)));
      if (index === this.index) return;
      this.index = index;

      const n = index + 1;
      if (this.current) {
        this.current.textContent = this.dataset.counterFormat === 'padded' ? String(n).padStart(2, '0') : String(n);
      }
      if (this.status) {
        this.status.textContent = `Image ${n} of ${this.slides.length}`;
      }
    }
  }

  customElements.define('nl-gallery', NlGallery);
})();
