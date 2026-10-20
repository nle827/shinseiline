/* nl-gallery: position counter, arrow-key navigation and a screen-reader
 * announcement for the Gallery block. Swiping itself is CSS scroll snap.
 *
 * Carousel semantics (focusable track, aria-roledescription) are applied
 * only while the track actually scrolls sideways, so a desktop stack isn't
 * announced as a carousel or added to the tab order.
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
      this.target = null;
      this.frame = null;

      this.onScroll = () => {
        if (this.frame) return;
        this.frame = requestAnimationFrame(() => {
          this.frame = null;
          this.update();
        });
      };
      this.onKeydown = (event) => {
        if (!this.swiping) return;
        const from = this.target ?? this.index;
        if (event.key === 'ArrowRight') this.go(from + 1, event);
        if (event.key === 'ArrowLeft') this.go(from - 1, event);
      };

      this.track.addEventListener('scroll', this.onScroll, { passive: true });
      this.track.addEventListener('keydown', this.onKeydown);
      this.resizeObserver = new ResizeObserver(() => this.applyMode());
      this.resizeObserver.observe(this.track);
      this.applyMode();
    }

    disconnectedCallback() {
      if (!this.track) return;
      this.track.removeEventListener('scroll', this.onScroll);
      this.track.removeEventListener('keydown', this.onKeydown);
      this.resizeObserver.disconnect();
      if (this.frame) cancelAnimationFrame(this.frame);
    }

    // Swipe semantics only while the track scrolls sideways
    applyMode() {
      const swiping = this.track.scrollWidth > this.track.clientWidth + 1;
      if (swiping === this.swiping) return;
      this.swiping = swiping;
      if (swiping) {
        this.track.setAttribute('tabindex', '0');
        this.track.setAttribute('aria-roledescription', 'carousel');
        this.slides.forEach((slide) => slide.setAttribute('aria-roledescription', 'slide'));
      } else {
        this.track.removeAttribute('tabindex');
        this.track.removeAttribute('aria-roledescription');
        this.slides.forEach((slide) => slide.removeAttribute('aria-roledescription'));
      }
    }

    go(index, event) {
      const next = Math.max(0, Math.min(this.slides.length - 1, index));
      event.preventDefault();
      if (next === (this.target ?? this.index)) return;
      this.target = next;
      this.track.scrollTo({
        left: next * this.track.clientWidth,
        behavior: reducedMotion.matches ? 'auto' : 'smooth',
      });
    }

    update() {
      const width = this.track.clientWidth || 1;
      const index = Math.max(0, Math.min(this.slides.length - 1, Math.round(this.track.scrollLeft / width)));
      if (index === this.target) this.target = null;
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
