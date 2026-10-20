/* nl-spec-list: accordion behaviour for the Specifications block.
 *
 * Opening one accordion closes the others: each open dispatches an
 * `nl:accordion-open` event on document, and every other nl accordion
 * closes in response. Host themes can join in by dispatching or listening
 * for the same event.
 */
(() => {
  if (customElements.get('nl-spec-list')) return;

  class NlSpecList extends HTMLElement {
    connectedCallback() {
      this.toggle = this.querySelector('.nl-spec-list__toggle');
      this.panel = this.querySelector('.nl-spec-list__panel');
      if (!this.toggle || !this.panel) return;

      this.onToggle = () => this.setOpen(this.toggle.getAttribute('aria-expanded') !== 'true');
      this.onOtherOpen = (event) => {
        if (event.detail && event.detail.source === this) return;
        this.setOpen(false, { silent: true });
      };
      // Theme editor: open the accordion when its block is selected
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

  customElements.define('nl-spec-list', NlSpecList);
})();
