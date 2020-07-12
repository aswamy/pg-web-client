import { LitElement, css, html } from 'lit-element';

class TabMenu extends LitElement {

  constructor() {
    super();

    // { id: <Number>, name: <String> }
    this.tabs = [
      {
        id: 0,
        name: 'Home'
      }
    ];
    
    this.selectedTabId = 0;
  }

  static get properties() {
    return {
      tabs: { type: Array, attribute: false },
      selectedTabId: { type: Number }
    }
  }

  createTab(tabType, params) {
    const tabId = new Date().getTime();
    
    this.tabs = [...this.tabs, {
      id: tabId,
      name: tabType
    }];

    this.dispatchEvent(new CustomEvent('new-tab', {
      detail: {
        tabId,
        tabType,
        params
      }
    }));
  }

  deleteTab(tabId, event) {

    event.stopPropagation();

    if(this.selectedTabId == tabId) {
      let newTabToFocus;

      for(let i = 0; i < this.tabs.length; i++) {
        if(this.tabs[i].id == tabId) {
          /* If you delete the current tab see if there is a tab to the right of it.
          * If a tab to the right exists, focus on it else focus on the left tab
          */
          let tabToFocusAfterDeletion;
          if(this.tabs[i+1]) {
            tabToFocusAfterDeletion = i+1;
          } else {
            tabToFocusAfterDeletion = i-1;
          }
          newTabToFocus = this.tabs[tabToFocusAfterDeletion];
        }
      }
      this.selectTab(newTabToFocus.id);
    }
    this.tabs = this.tabs.filter(t => t.id != tabId);
    this.dispatchEvent(new CustomEvent('delete-tab', {
      detail: {
        tabId
      }
    }));
  }

  selectTab(tabId) {
    this.selectedTabId = tabId;

    this.dispatchEvent(new CustomEvent('select-tab', {
      detail: {
        tabId
      }
    }));
  }

  render() {
    return html`
      ${this.externalStyles}
      <div class="tabs is-boxed">
        <ul>
          ${this.tabs.map(tab => {
            return html`<li
              class=${this.selectedTabId == tab.id ? 'is-active': ''}
              @click=${this.selectTab.bind(this, tab.id)}
              ><a>
              ${tab.id == 0 ?
                html`<svg class="tabIcon"><use xlink:href="/icons/icons.svg#home"></use></svg>` :
                html`<span style="padding-right:10px">${tab.name}</span>
                  <svg @click=${this.deleteTab.bind(this,tab.id)} class="tabCloseBtn"><use xlink:href="/icons/icons.svg#close"></use></svg>`
              }
              </a></li>`
          })}
          <li><a @click="${this.createTab.bind(this, 'SQL Query')}">
            <svg class="tabIcon"><use xlink:href="/icons/icons.svg#plus"></use></svg>
          </a></li>
        </ul>
      </div>
    `;
  }

  get externalStyles() {
    return html`
      <link rel="stylesheet" href="/css/bulma.min.css">
    `;
  }

  static get styles() {
    return css`
      .tabs {
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
      }
      .tabCloseBtn {
        width: 16px;
        height: 16px;
        fill: var(--alternate-highlight-color-dark);
      }
      .tabCloseBtn:hover {
        fill: var(--alternate-highlight-color-darker);
      }
      .tabIcon {
        width:20px;
        height:20px;
      }
      li.is-active .tabIcon {
        fill: var(--main-highlight-color);
      }
      .tabs li.is-active a {
        height: 36px;
      }
    `;
  }
}

window.customElements.define('tab-menu', TabMenu);