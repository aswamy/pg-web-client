import { LitElement, html } from 'lit-element';

class HomeTab extends LitElement {

  constructor() {
    super();
  }

  static get properties() {
    return {
      tabId: { type: Number, attribute: 'tab-id' },
      isVisible: { type: Boolean, attribute: 'is-visible' },
      sessionId: { type: String, attribute: 'session-id' }
    }
  }

  render() {
    if(!this.isVisible) {
      return html``;
    }

    return html`
      ${this.htmlStyle}
      <div class="homeTabWrapper">
      </div>
    `;
  }

  get htmlStyle() {
    return html`
    <style>
      .homeTabWrapper {
        border: 1px solid #dbdbdb;
        padding: 0.75rem;
        width: 100%;
      }
    </style>
    `;
  }
}

window.customElements.define('home-tab', HomeTab);