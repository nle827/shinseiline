/* nl-size-chart: IN/CM toggle and accordion for the Size chart block.
 *
 * - The chosen unit is remembered in localStorage and applied to every size
 *   chart on the page (they stay in sync through an `nl:size-unit` event).
 * - In accordion mode, opening it closes other accordions through the shared
 *   `nl:accordion-open` event (see nl-spec-list).
 */
(() => {
  if (customElements.get('nl-size-chart')) return;

  const STORAGE_KEY = 'nl-size-unit';
  const UNIT_NAMES = { in: 'inches', cm: 'centimetres' };

  const readStoredUnit = () => {
    try {
      const unit = localStorage.getItem(STORAGE_KEY);
      return unit === 'in' || unit === 'cm' ? unit : null;
    } catch (e) {
      return null;
    }
  };

  const storeUnit = (unit) => {
    try {
      localStorage.setItem(STORAGE_KEY, unit);
    } catch (e) {
      /* storage unavailable: the choice just isn't remembered */
    }
  };

  class NlSizeChart extends HTMLElement {
    connectedCallback() {
      this.toggle = this.querySelector('.nl-size-chart__toggle');
      this.panel = this.querySelector('.nl-size-chart__panel');
      this.unitButtons = [...this.querySelectorAll('.nl-size-chart__unit')];

      this.onUnitClick = (event) => {
        const unit = event.currentTarget.dataset.unit;
        storeUnit(unit);
        document.dispatchEvent(new CustomEvent('nl:size-unit', { detail: { unit } }));
      };
      this.onUnitChange = (event) => this.applyUnit(event.detail.unit);
      this.unitButtons.forEach((button) => button.addEventListener('click', this.onUnitClick));
      document.addEventListener('nl:size-unit', this.onUnitChange);

      this.applyUnit(readStoredUnit() || this.dataset.defaultUnit || 'in');

      if (this.toggle && this.panel) {
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
    }

    disconnectedCallback() {
      this.unitButtons.forEach((button) => button.removeEventListener('click', this.onUnitClick));
      document.removeEventListener('nl:size-unit', this.onUnitChange);
      if (this.toggle) {
        this.toggle.removeEventListener('click', this.onToggle);
        document.removeEventListener('nl:accordion-open', this.onOtherOpen);
        document.removeEventListener('shopify:block:select', this.onEditorSelect);
      }
    }

    applyUnit(unit) {
      if (unit !== 'in' && unit !== 'cm') return;
      this.unitButtons.forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.unit === unit));
      });
      this.querySelectorAll('td[data-in]').forEach((cell) => {
        cell.textContent = cell.dataset[unit];
      });
      const name = this.querySelector('[data-unit-name]');
      if (name) name.textContent = UNIT_NAMES[unit];
    }

    setOpen(open, { silent = false } = {}) {
      this.toggle.setAttribute('aria-expanded', String(open));
      this.panel.hidden = !open;
      if (open && !silent) {
        document.dispatchEvent(new CustomEvent('nl:accordion-open', { detail: { source: this } }));
      }
    }
  }

  customElements.define('nl-size-chart', NlSizeChart);
})();
