/* nl-accordion: collapsible row. Opening one closes the others through the
 * shared `nl:accordion-open` event on document.
 */
(() => {
  if (customElements.get('nl-accordion')) return;

  class NlAccordion extends HTMLElement {
    connectedCallback() {
      this.toggle = this.querySelector('.nl-accordion__toggle');
      this.panel = this.querySelector('.nl-accordion__panel');
      if (!this.toggle || !this.panel) return;

      this.onToggle = () => this.setOpen(this.toggle.getAttribute('aria-expanded') !== 'true');
      this.onOtherOpen = (event) => {
        if (event.detail && event.detail.source === this) return;
        this.setOpen(false, { silent: true });
      };
      this.onEditorSelect = (event) => {
        if (this.contains(event.target)) this.setOpen(true);
      };

      this.toggle.addEventListener('click', this.onToggle);
      document.addEventListener('nl:accordion-open', this.onOtherOpen);
      document.addEventListener('shopify:block:select', this.onEditorSelect);
    }

    disconnectedCallback() {
      if (!this.toggle) return;
      this.toggle.removeEventListener('click', this.onToggle);
      document.removeEventListener('nl:accordion-open', this.onOtherOpen);
      document.removeEventListener('shopify:block:select', this.onEditorSelect);
    }

    setOpen(open, { silent = false } = {}) {
      this.toggle.setAttribute('aria-expanded', String(open));
      this.panel.hidden = !open;
      if (open && !silent) {
        document.dispatchEvent(new CustomEvent('nl:accordion-open', { detail: { source: this } }));
      }
    }
  }

  customElements.define('nl-accordion', NlAccordion);
})();
