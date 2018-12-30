import { LitElement, html } from '@polymer/lit-element';

const connectionAPI = '/api/connections';

class SqlQueryTab extends LitElement {

  constructor() {
    super();

    this._onTextAreaFocus(4, 1);

    this.sqlError = null;
    this.sqlResult = null;

    this._assignHotKeys();
  }

  static get properties() {
    return {
      visible: { type: Boolean },
      sessionId: { type: String }
    }
  }

  _assignHotKeys() {
    hotkeys('ctrl+shift+enter', (event, handler) => {
      if(this.visible) {
        event.preventDefault();
        this._onRun();
      }
    });
    hotkeys('ctrl+s', (event, handler) => {
      if(this.visible) {
        event.preventDefault();
        //TODO: handle save of sql file
      }
    });
    hotkeys('ctrl+o', (event, handler) => {
      if(this.visible) {
        event.preventDefault();
        //TODO: handle open of sql file
    }
    });
  }

  render() {

    if(!this.visible) {
      return;
    }

    let resultsTable = null;

    if(this.sqlResult) {
      resultsTable = html`
        <p class="sqlQueryTabResultsMessage"><strong>Records:</strong> ${this.sqlResult.rows.length}</p>
        <table class="table is-bordered is-striped is-narrow">
          <thead>
            <tr>
              ${this.sqlResult.fields.map(field => html`<th>${field.name}</th>`)}
            </tr>
          </thead>
          <tbody>
            ${
              this.sqlResult.rows.map(row => {
                return html`<tr>${this.sqlResult.fields.map(field => {
                  let value = row[field.name];

                  if(typeof value == 'object') {
                    value = JSON.stringify(value);
                  }

                  return html`<td title="${value}">${value}</td>`
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
            <i title="Run" class="material-icons" @click="${this._onRun}">play_arrow</i>
            <i title="Stop" class="material-icons" disabled>stop</i>
            <i title="Save" class="material-icons">save</i>
            <i title="Open" class="material-icons">folder_open</i>
          </div>
          <div class="sqlQueryTabMenuItemsRight">
            <i title="History" class="material-icons">storage</i>
          </div>
        </div>
        <textarea style="flex-grow:${this._editorTextAreaSize}" @click="${this._onTextAreaFocus.bind(this, 4, 1)}" class="sqlQueryTabEditor"></textarea>
        <div style="flex-grow:${this._resultsTextAreaSize}" @click="${this._onTextAreaFocus.bind(this, 1, 4)}" class="sqlQueryTabResults" readonly>
          <div>${this.sqlError}</div>
          <div>${resultsTable}</div>
        </div>
      </div>
    `;
  }

  _onTextAreaFocus(editorSize, resultsSize) {
    this._editorTextAreaSize = editorSize;
    this._resultsTextAreaSize = resultsSize;

    this._invalidate();
  }

  _onRun() {

    this.sqlError = null;
    this.sqlResult = null;
    this._invalidate();

    let editor = this.shadowRoot.querySelector('.sqlQueryTabEditor');
    let editorContent = editor.value;

    if(editor.selectionStart != editor.selectionEnd) {
      editorContent = editorContent.substring(editor.selectionStart, editor.selectionEnd);
    }
    
    if(editorContent.length == 0) {
      return;
    }

    fetch(`${connectionAPI}/${this.sessionId}/query`, {
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
        this.sqlError = parsedResult.error;
      } else if(parsedResult.rows && parsedResult.fields) {
        this.sqlResult = parsedResult;
        this._onTextAreaFocus(1, 4);
      } else {
        this.sqlError = 'SQL Query was executed';
      }

      this._invalidate();
    })
    .catch(error => {
      this.sqlError = 'Could not process the SQL Request';
      this._invalidate();
    })
    .then(() => {
      editor.focus();
    });
  }

  get htmlStyle() {
    return html`
      <link rel="stylesheet" href="/libs/bulma/bulma.min.css">
      <link rel="stylesheet" href="/css/material.css">
      <style>
      .sqlQueryTabMenu {
        display: flex;
        background-color: #f5f5f5;
        border-color: #dbdbdb;
        border-style: solid;
        border-width: 1px 1px 0px 1px;
      }
      .sqlQueryTabMenu .material-icons {
        padding: 0.25rem 0.5rem;
        border-color: #dbdbdb;
        border-style: solid;
        border-width: 0px 1px 0px 0px;
        cursor: pointer;
        user-select: none;
      }
      .sqlQueryTabMenu .material-icons:first-child {
        border-width: 0px 1px 0px 1px;
      }
      .material-icons:hover {
        background-color: #dbdbdb;
      }
      .material-icons:active {
        color: #3273dc;
      }
      .material-icons[disabled] {
        color: #dbdbdb !important;
        background-color: inherit !important;
        pointer-events: none;
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