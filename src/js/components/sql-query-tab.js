import { LitElement, html, css } from 'lit-element';
import hotkeys from 'hotkeys-js';

import { copyToClipboard } from '../utils/clipboard.util.js';
import { CONNECTION_API, ConnectionService } from '../services/connection_service.js';
import HistoryService from '../services/history_service.js';

class SqlQueryTab extends LitElement {

  constructor() {
    super();

    this.sqlQuery = '';

    this.acquireDatabaseSession();

    this._assignHotKeys();
    this._sqlQueryHistory = [];
  }

  static get properties() {
    return {
      tabId: { type: Number, attribute: 'tab-id' },
      isVisible: { type: Boolean, attribute: 'is-visible' },

      params : { type: Object },

      sessionId: { type: String, attribute: false },
      // Error from the query run
      _sqlError: { type: String, attribute: false },
      // Result from the query run
      _sqlResult: { type: Object, attribute: false },
      _sqlQueryHistory: { type: Array, attribute: false}
    }
  }

  updated(changedProperties) {
    /*
     * When a SQL Query Tab has become visible,
     * 1) Add a listener to watch the editor's text
     * 2) If a previous query exists, load it up
     */
    if(changedProperties.has('isVisible') && this.isVisible) {
      console.debug(`Tab #${this.tabId} is visible`);
      
      let editor = this.shadowRoot.querySelector('.sqlQueryTabEditor');

      editor.value = this.params.sqlQuery || '';
      editor.addEventListener('input', (e) => this.params.sqlQuery = e.target.value);
      editor.addEventListener('focus', (e) => this._onViewSqlQueryHistory('close'));
    }
  }

  _assignHotKeys() {
    hotkeys('ctrl+shift+enter', (event, handler) => {
      if(this.isVisible) {
        event.preventDefault();
        this._onRun();
      }
    });
  }

  acquireDatabaseSession() {
    ConnectionService.createConnection().then(connection => {
      this.sessionId = connection.id;
    })
    .catch(error => {
      this._sqlError = 'Tab could not acquire SQL session. Close other tabs or reload the application.';
    });
  }

  releaseDatabaseSession() {
    ConnectionService.destroyConnection(this.sessionId)
      .catch(error => {
        console.error(`Could not release Database session with id ${this.sessionId}.`);
      });
  }

  _onLaunchNewTab(sqlQuery) {
    document.querySelector('tab-menu').createTab('SQL Query', { sqlQuery });
  }

  _focusTopTextArea(isTop) {
    let TOP_TEXT_AREA;
    let BOTTOM_TEXT_AREA;

    if(isTop) {
      TOP_TEXT_AREA = '70%';
      BOTTOM_TEXT_AREA = '30%';
    } else {
      TOP_TEXT_AREA = '30%';
      BOTTOM_TEXT_AREA = '70%';
    }

    this.shadowRoot.querySelector('.sqlResizableContent').style['grid-template-rows'] = `${TOP_TEXT_AREA} ${BOTTOM_TEXT_AREA}`;
  }

  _onSave() {
    const saveFileName = `SQLQuery_${Date.now()}.sql`;
    const data = [ this.params.sqlQuery ];
    const url = URL.createObjectURL(new File(data, saveFileName, { type: 'text/plain' }));

    // Use a fake 'a' tag to let the user download SQL Query
    const element = document.createElement('a');
    element.setAttribute('download', saveFileName);
    element.setAttribute('href', url);
    element.click();

    URL.revokeObjectURL(url);
  }

  _onRun() {

    this._sqlError = null;
    this._sqlResult = null;

    let editor = this.shadowRoot.querySelector('.sqlQueryTabEditor');
    let editorContent = editor.value;

    // If a piece of text is highlighted, only run that section
    // TODO: check to see if the highlighted text is inside the editor
    let highlightedText = this.shadowRoot.getSelection().toString();
    editorContent = highlightedText || editorContent;

    if(editorContent.length == 0) {
      return;
    }

    fetch(`${CONNECTION_API}/${this.sessionId}/query`, {
      method: 'POST',
      body: JSON.stringify({
        query: editorContent
      }),
      headers:{
        'Content-Type': 'application/json'
      }
    })
    .then(result => result.json())
    .then(parsedResult => {

      if(parsedResult.error) {
        this._sqlError = parsedResult.error;
      } else if(parsedResult.rows && parsedResult.fields) {
        this._sqlResult = parsedResult;
        this._focusTopTextArea(false);

        HistoryService.prependSqlQueryHistory(editorContent);
      } else {
        this._sqlError = 'SQL Query was executed';
      }
    })
    .catch(error => {
      this._sqlError = 'Could not process the SQL Request';
    })
    .then(() => {
      editor.focus();
    });
  }

  _onViewSqlQueryHistory(operation = 'toggle') {

    let dropdown = this.shadowRoot.querySelector('#sqlQueryHistoryDropdown');
    let dropdownBtn = this.shadowRoot.querySelector('#sqlQueryHistoryBtn');

    if(dropdown && dropdownBtn) {
      if(operation == 'open') {
        this._sqlQueryHistory = HistoryService.getSqlQueryHistory();
        dropdown.style.display = 'initial';
        dropdownBtn.classList.add('active');
        hotkeys('esc', (event, handler) => {
          event.preventDefault();
          this._onViewSqlQueryHistory('close');
        });
      } else if(operation == 'close') {
        hotkeys.unbind('esc');
        dropdown.style.display = 'none';
        dropdownBtn.classList.remove('active');
      } else {
        this._onViewSqlQueryHistory(
          dropdown.style.display == 'none' ?
          'open' : 'close'
        )
      }
    }
  }

  render() {
    if(!this.isVisible) {
      hotkeys.unbind('*');
      return html``;
    }

    return html`
      ${this.externalStyles}

      <div class="sqlQueryTabWrapper">
        <div class="sqlQueryTabMenu">
          <div class="sqlQueryTabMenuItemsLeft">
            
            <div class="sqlQueryTabMenuItem" ?disabled=${false} @click="${this._onRun}" title="Run"><svg><use xlink:href="/icons/icons.svg#run"></use></svg></div>
            <div class="sqlQueryTabMenuItem" ?disabled=${true} title="Stop"><svg><use xlink:href="/icons/icons.svg#stop"></use></svg></div>
            <div class="sqlQueryTabMenuItem" ?disabled=${!this.params.sqlQuery} @click="${this._onSave}" title="Save"><svg><use xlink:href="/icons/icons.svg#save"></use></svg></div>
            <div class="sqlQueryTabMenuItem" ?disabled=${false} title="Open"><svg><use xlink:href="/icons/icons.svg#open"></use></svg></div>
          </div>
          <div class="sqlQueryTabMenuItemsRight">
            <div class="dropdown is-right is-active">
              <div class="dropdown-trigger">
                <div id="sqlQueryHistoryBtn" class="sqlQueryTabMenuItem" @click="${this._onViewSqlQueryHistory.bind(this)}" title="History"><svg><use xlink:href="/icons/icons.svg#history"></use></svg></div>
              </div>
              <div id="sqlQueryHistoryDropdown" style="display:none" class="dropdown-menu">
                <div class="dropdown-content">
                  ${this._sqlQueryHistory.map(historicQuery => html`
                    <div class="dropdown-item columns">
                      <div title="${historicQuery}" class="column sqlQueryHistoryMessage">${historicQuery}</div>
                      <div @click="${() => copyToClipboard(historicQuery, 'SQL has been copied to your clipboard')}" title="Copy SQL to clipboard" class="column sqlQueryHistoryMenuIcon"><svg title="Copy"><use xlink:href="/icons/icons.svg#copy"></use></svg></div>
                      <div @click="${this._onLaunchNewTab.bind(this, historicQuery)}" title="Open SQL in new tab" class="column sqlQueryHistoryMenuIcon"><svg title="Open"><use xlink:href="/icons/icons.svg#launch"></use></svg></div>
                    </div>
                  `)}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="sqlResizableContent">
          <textarea ?disabled=${!this.sessionId} spellcheck="false" @click="${this._focusTopTextArea.bind(this, true)}" class="sqlQueryTabEditor"></textarea>
          <div @click="${this._focusTopTextArea.bind(this, false)}" class="sqlQueryTabResults" readonly>
            <sql-query-table .sqlResult=${this._sqlResult} .sqlError=${this._sqlError} />
          </div>
        </div>
        <div class="sqlQueryTabResultsMeta">${this._sqlResult ? html`<strong>Records:</strong> ${this._sqlResult.rows.length}` : null }</div>
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
      :host {
        --sql-query-tab-menu-height: 33px;
        --sql-query-result-meta-height: 28px;
      }
      .sqlQueryTabMenu {
        display: flex;
        background-color: var(--alternate-highlight-color-light);
        border-color: var(--alternate-highlight-color-dark);
        border-style: solid;
        border-width: 1px 1px 0px 1px;
        height: var(--sql-query-tab-menu-height);
      }
      .sqlQueryTabMenu .dropdown-menu {
        padding-top: 10px;
        width: 400px;
      }
      .sqlQueryTabMenu .dropdown-menu .dropdown-content {
        padding: 0;
        border-radius: 0px;
      }
      .sqlQueryHistoryMessage {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow-x: hidden;
        padding: 4px 10px;
      }
      .sqlQueryHistoryMenuIcon {
        max-width: 32px;
        padding: 10px 4px;
      }
      .sqlQueryHistoryMenuIcon > svg {
        height: 14px;
        width: 14px;
      }
      .sqlQueryHistoryMenuIcon:hover {
        fill: var(--main-highlight-color);
        cursor: pointer;
      }
      .sqlQueryTabMenu .dropdown-menu .dropdown-item {
        margin: 0;
        padding: 0;
      }
      .dropdown-item + .dropdown-item {
        border-top: 1px solid var(--alternate-highlight-color-light);
      }
      .sqlQueryTabMenu .dropdown-menu .dropdown-item:hover {
        background-color: var(--alternate-highlight-color-light);
      }
      .sqlQueryTabMenuItem {
        padding: 0.25rem 0.5rem;
        border-color: var(--alternate-highlight-color-dark);
        border-style: solid;
        border-width: 0px 1px 0px 0px;
        cursor: pointer;
        user-select: none;
      }
      .sqlQueryTabMenuItem:first-child {
        border-width: 0px 1px 0px 1px;
      }
      .sqlQueryTabMenuItem:hover, .sqlQueryTabMenuItem.active {
        background-color: var(--alternate-highlight-color-dark);
      }
      .sqlQueryTabMenuItem:active, .sqlQueryTabMenuItem.active {
        fill: var(--main-highlight-color);
      }
      .sqlQueryTabMenuItem[disabled] {
        background-color: inherit !important;
        pointer-events: none;
      }
      .sqlQueryTabMenuItem > svg {
        height: 24px;
        width: 24px;
      }
      .sqlQueryTabMenuItem[disabled] > svg {
        fill: var(--alternate-highlight-color-dark);
      }
      .sqlQueryTabMenuItemsRight, .sqlQueryTabMenuItemsLeft {
        display: flex;
        flex-grow: 1;
      }
      .sqlQueryTabMenuItemsRight {
        justify-content: flex-end;
        margin-right: 0.75rem;
      }
      .sqlQueryTabMenuItemsLeft {
        margin-left: 0.75rem;
      }
      .sqlQueryTabEditor:focus, .sqlQueryTabResults:focus {
        outline: none !important;
      }
      .sqlQueryTabEditor, .sqlQueryTabResults {
        font-family: monospace;
        font-size: 14px;
        border: 1px solid var(--alternate-highlight-color-dark);
        resize: none;
      }
      .sqlQueryTabEditor {
        padding: 0.75rem;
        overflow-y: auto;
      }
      .sqlQueryTabResults {
        margin-top: 10px;
        overflow: auto;
        position: relative;
      }
      .sqlQueryTabWrapper {
        width: 100%;
        height: 100%;
      }
      .sqlResizableContent {
        display: grid;
        grid-template-rows: 70% 30%;
        height: calc(100% - var(--sql-query-result-meta-height) - var(--sql-query-tab-menu-height));
      }
      .sqlQueryTabResultsMeta {
        background-color: var(--alternate-highlight-color-light);
        border: 1px solid var(--alternate-highlight-color-dark);
        border-top: 0px;
        font-size: 12px;
        text-align: right;
        padding: 0.25rem 0.75rem;
        height: var(--sql-query-result-meta-height);
      }
    `;
  }
}

window.customElements.define('sql-query-tab', SqlQueryTab);