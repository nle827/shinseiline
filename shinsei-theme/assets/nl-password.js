/* nl-password: staff-login hotspot and instant signup confirmation for the
 * Password page section.
 *
 * Shopify's customer form reloads the page and doesn't always keep its
 * "posted successfully" state (e.g. after a captcha step), so the
 * confirmation is shown on submit and remembered for the reload.
 */
(() => {
  if (customElements.get('nl-password')) return;

  const CONFIRMED_KEY = 'nl-password-signup';

  class NlPassword extends HTMLElement {
    connectedCallback() {
      this.form = this.querySelector('.nl-password__form');
      this.hotspot = this.querySelector('[data-staff-open]');

      this.onStaffOpen = () => {
        this.classList.add('is-staff');
        const input = this.querySelector('.nl-password__staff-form input[type="password"]');
        if (input) input.focus();
      };
      if (this.hotspot) this.hotspot.addEventListener('click', this.onStaffOpen);

      if (!this.form) return;

      // Shopify appends #<form id> after a form post; drop it from the address bar
      if (this.form.id && window.location.hash === `#${this.form.id}`) {
        history.replaceState({}, '', window.location.pathname + window.location.search);
      }

      try {
        if (sessionStorage.getItem(CONFIRMED_KEY)) {
          sessionStorage.removeItem(CONFIRMED_KEY);
          this.showConfirmation();
        }
      } catch (e) {
        /* storage unavailable */
      }

      this.onSubmit = () => {
        const email = this.form.querySelector('input[name="contact[email]"]');
        if (!email || !email.value) return;
        try {
          sessionStorage.setItem(CONFIRMED_KEY, '1');
        } catch (e) {
          /* storage unavailable */
        }
        this.showConfirmation();
      };
      this.form.addEventListener('submit', this.onSubmit);
    }

    disconnectedCallback() {
      if (this.hotspot) this.hotspot.removeEventListener('click', this.onStaffOpen);
      if (this.form) this.form.removeEventListener('submit', this.onSubmit);
    }

    showConfirmation() {
      if (this.form.querySelector('.nl-password__message')) return;
      this.form.hidden = true;
      const message = document.createElement('p');
      message.className = 'nl-password__message';
      message.setAttribute('role', 'status');
      message.textContent = this.dataset.success || '';
      this.form.parentNode.insertBefore(message, this.form);
    }
  }

  customElements.define('nl-password', NlPassword);
})();
