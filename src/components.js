import { LitElement, html } from '@polymer/lit-element';

const connectionAPI = '/api/connections';

class SqlQueryTab extends LitElement {

  constructor() {
    super();

    this._onTextAreaFocus(4, 1);

    this.sqlError = null;
    this.sqlResult = null;
  }

  static get properties() {
    return {
      visible: { type: Boolean },
      sessionId: { type: String }
    }
  }

  render() {

    if(!this.visible) {
      return;
    }

    let resultsTable = null;

    if(this.sqlResult) {
      resultsTable = html`
        <p style="margin-bottom: 10px"><strong>Records:</strong> ${this.sqlResult.rows.length}</p>
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
                  return html`<td>${row[field.name]}</td>`
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

    fetch(`${connectionAPI}/${this.sessionId}/query`, {
      method: 'POST',
      body: JSON.stringify({
        query: this.shadowRoot.querySelector('.sqlQueryTabEditor').value
      }),
      headers:{
        'Content-Type': 'application/json'
      }
    })
    .then(result => result.json())
    .then(parsedResult => {

      if(parsedResult.error) {
        this.sqlError = parsedResult.error;
      } else {
        this.sqlResult = parsedResult;

        this._onTextAreaFocus(1, 4);
      }

      this._invalidate();
    })
    .catch(error => {
      this.sqlError = 'Could not process the SQL Request';
      this._invalidate();
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
        overflow-x: auto;
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