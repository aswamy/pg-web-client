import { LitElement, html } from '@polymer/lit-element';

class SqlQueryTab extends LitElement {

  constructor() {
    super();

    this._onTextAreaFocus(4, 1);
    this._assignHotKeys();
  }

  static get properties() {
    return {
      tabId: { type: Number, attribute: 'tab-id' },
      isVisible: { type: Boolean, attribute: 'is-visible' },
      sessionId: { type: String },

      _sqlError: { type: String, attribute: false },
      _sqlResult: { type: String, attribute: false },
      _editorTextAreaSize: { type: Number, attribute: false },
      _resultsTextAreaSize: { type: Number, attribute: false }
    }
  }

  _assignHotKeys() {
    hotkeys('ctrl+shift+enter', (event, handler) => {
      if(this.isVisible) {
        event.preventDefault();
        this._onRun();
      }
    });
    hotkeys('ctrl+s', (event, handler) => {
      if(this.isVisible) {
        event.preventDefault();
        //TODO: handle save of sql file
      }
    });
    hotkeys('ctrl+o', (event, handler) => {
      if(this.isVisible) {
        event.preventDefault();
        //TODO: handle open of sql file
    }
    });
  }

  render() {

    if(!this.isVisible) {
      return html``;
    }

    let resultsTable = null;

    if(this._sqlResult) {
      resultsTable = html`
        <p class="sqlQueryTabResultsMessage"><strong>Records:</strong> ${this._sqlResult.rows.length}</p>
        <table class="table is-bordered is-striped is-narrow">
          <thead>
            <tr>
              ${this._sqlResult.fields.map(field => html`<th>${field.name}</th>`)}
            </tr>
          </thead>
          <tbody>
            ${
              this._sqlResult.rows.map(row => {
                return html`<tr>${this._sqlResult.fields.map(field => {
                  let value = row[field.name];

                  if(value === null || value === undefined) {
                    return html`<td><em>null<em></td>`;
                  } else {
                    if(typeof value == 'object') {
                      value = JSON.stringify(value);
                    }
                    return html`<td title="${value}">${value}</td>`;
                  }
                })}</tr>`
              })
            }
          </tbody>
        </table>
      `;
    }

    return html`
      
      ${this.htmlStyle}

      <div class="sqlQueryTabWrapper">
        <div class="sqlQueryTabMenu">
          <div class="sqlQueryTabMenuItemsLeft">
            <div class="sqlQueryTabMenuItem" @click="${this._onRun}"><svg title="Run"><use xlink:href="/icons/icons.svg#run"></use></svg></div>
            <div class="sqlQueryTabMenuItem" disabled><svg title="Stop"><use xlink:href="/icons/icons.svg#stop"></use></svg></div>
            <div class="sqlQueryTabMenuItem"><svg title="Save"><use xlink:href="/icons/icons.svg#save"></use></svg></div>
            <div class="sqlQueryTabMenuItem"><svg title="Open"><use xlink:href="/icons/icons.svg#open"></use></svg></div>
          </div>
          <div class="sqlQueryTabMenuItemsRight">
            <div class="sqlQueryTabMenuItem"><svg title="History"><use xlink:href="/icons/icons.svg#history"></use></svg></div>
          </div>
        </div>
        <div contenteditable style="flex-grow:${this._editorTextAreaSize}" @click="${this._onTextAreaFocus.bind(this, 4, 1)}" class="sqlQueryTabEditor"></div>
        <div style="flex-grow:${this._resultsTextAreaSize}" @click="${this._onTextAreaFocus.bind(this, 1, 4)}" class="sqlQueryTabResults" readonly>
          <div>${this._sqlError}</div>
          <div>${resultsTable}</div>
        </div>
      </div>
    `;
  }

  _onTextAreaFocus(editorSize, resultsSize) {
    this._editorTextAreaSize = editorSize;
    this._resultsTextAreaSize = resultsSize;
  }

  _onRun() {

    this._sqlError = null;
    this._sqlResult = null;

    let editor = this.shadowRoot.querySelector('.sqlQueryTabEditor');
    let editorContent = editor.innerText;

    // If a piece of text is highlighted, only run that section
    let highlightedText = this.shadowRoot.getSelection();
    if(highlightedText.toString() && highlightedText.anchorNode.parentElement.classList.contains('sqlQueryTabEditor')) {
      editorContent = highlightedText.toString();
    }

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
        this._onTextAreaFocus(1, 4);
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

  get htmlStyle() {
    return html`
      <link rel="stylesheet" href="/libs/bulma/bulma.min.css">
      <style>
      .sqlQueryTabMenu {
        display: flex;
        background-color: #f5f5f5;
        border-color: #dbdbdb;
        border-style: solid;
        border-width: 1px 1px 0px 1px;
      }
      .sqlQueryTabMenuItem {
        padding: 0.25rem 0.5rem;
        border-color: #dbdbdb;
        border-style: solid;
        border-width: 0px 1px 0px 0px;
        cursor: pointer;
        user-select: none;
      }
      .sqlQueryTabMenuItem:first-child {
        border-width: 0px 1px 0px 1px;
      }
      .sqlQueryTabMenuItem:hover {
        background-color: #dbdbdb;
      }
      .sqlQueryTabMenuItem:active {
        fill: #3273dc;
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
        fill: #dbdbdb;
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
        border: 1px solid #dbdbdb;
        resize: none;
        padding: 0.75rem;
      }
      .sqlQueryTabResults {
        margin-top: 10px;
        overflow: auto;
      }
      .sqlQueryTabResultsMessage {
        text-align: right;
        margin-bottom: 10px;
      }
      .sqlQueryTabResults td, .sqlQueryTabResults th {
        white-space: nowrap;
        max-width: 300px;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .sqlQueryTabWrapper {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        width: 100%;
      }
      </style>`;
  }
}

window.customElements.define('sql-query-tab', SqlQueryTab);