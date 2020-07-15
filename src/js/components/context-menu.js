import { LitElement, css, html } from 'lit-element';
import { styleMap } from 'lit-html/directives/style-map.js';

/**
 * Inspired by the following article, however, had to take it further
 * to incorporate compatibility with ShadowDOMs. The changes
 * were too great to just fork. Might have to upload this component as
 * a separate standalone component.
 * 
 * https://www.sitepoint.com/building-custom-right-click-context-menu-javascript
 */
class ContextMenu extends LitElement {
  constructor() {
    super();

    this.resetContextMenu();
  }

  static get properties() {
    return {};
  }

  firstUpdated() {
    // Dismiss the context menu if clicked anywhere
    window.addEventListener('click', (e) => {
      e.preventDefault();
      this.dismissContextMenu();
      return false;
    });
    // Don't dimiss the context menu if the click is on the menu
    this.shadowRoot.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    });
  }

  resetContextMenu() {
    this.showContextMenu = false;
    this.showCoordinates = [0, 0];
    this.contextMenuOptions = [];
  }

  constructContextMenu(coordinates = [0, 0], options = []) {
    this.showCoordinates = coordinates;
    this.contextMenuOptions = options;
    this.showContextMenu = true;
    this.requestUpdate();
  }

  dismissContextMenu() {
    this.resetContextMenu();
    this.requestUpdate();
  }

  selectMenuItem(e, item) {
    e.preventDefault();
    if(Boolean(item.disabled)) {
      e.stopPropagation();
      return false;
    }
    item.select && item.select();
    this.dismissContextMenu();
  }

  render() {
    if(!(this.showContextMenu && this.contextMenuOptions.length)) {
      return null;
    }

    return html`
    <nav class="context-menu" style=${styleMap({
      top: this.showCoordinates[1],
      left: this.showCoordinates[0]
    })}>
      ${this.contextMenuOptions.map(section =>
        html`
        <section class="context-menu__section">
          ${section.title ? html`<p class="context-menu__section-title">${section.title}</p>`: null}
          <ul class="context-menu__items">
            ${section.items.map(item =>
              html`<li
                @click=${(e) => this.selectMenuItem(e, item)}
                class="context-menu__item">
                <a ?disabled=${Boolean(item.disabled)} class="context-menu__link">${item.title}</a>
              </li>`
            )}
          </ul>
        </section>
        `
      )}
    </nav>
    `;
  }

  static get styles() {
    return css`
    .context-menu {
      position: absolute;
      z-index: 9999;
      padding: 6px 0;
      width: auto;
      min-width: 200px;
      background-color: #fff;
      border: solid 1px var(--alternate-highlight-color-dark);
      box-shadow: 1px 1px 2px var(--alternate-highlight-color-dark);
      font-size: 14px;
      user-select: none;
    }
    .context-menu__section:not(:last-child) {
      margin-bottom: 10px;
    }
    .context-menu__section-title {
      color: var(--main-highlight-color);
      font-size: .75em;
      letter-spacing: .1em;
      text-transform: uppercase;
      margin: 5px;
    }
    .context-menu__items {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .context-menu__item {
      display: block;
      margin-bottom: 4px;
    }
    .context-menu__item:last-child {
      margin-bottom: 0;
    }
    .context-menu__link[disabled] {
      cursor: not-allowed;
      opacity: 0.7;
    }
    .context-menu__link {
      display: block;
      padding: 2px 12px;
      color: var(--alternate-highlight-color-darker);
      text-decoration: none;
    }
    .context-menu__link:not([disabled]):hover {
      color: #fff;
      background-color: var(--main-highlight-color);
      cursor: pointer;
    }
    `;
  }
}

window.customElements.define('context-menu', ContextMenu);