import { LitElement, html, css } from 'lit-element';

import { CONNECTION_API, ConnectionService } from '../services/connection_service.js';

class SqlTableTab extends LitElement {

  constructor() {
    super();

    this.sessionId = null;
    this.sqlResult = null;
  }

  static get properties() {
    return {
      tabId: { type: Number, attribute: 'tab-id' },
      isVisible: { type: Boolean, attribute: 'is-visible' },

      params: { type: Object },
    }
  }

  async firstUpdated() {
    await this.acquireDatabaseSession();
    this.fetchTableData();
  }

  acquireDatabaseSession() {
    return ConnectionService.createConnection().then(connection => {
      this.sessionId = connection.id;
    })
    .catch(error => {
      this._sqlError = 'Tab could not acquire SQL session. Close other tabs or reload the application.';
    });
  }

  releaseDatabaseSession() {
    return ConnectionService.destroyConnection(this.sessionId)
      .catch(error => {
        console.error(`Could not release Database session with id ${this.sessionId}.`);
      });
  }

  fetchTableData() {
    console.log('Fetching data');

    fetch(`${CONNECTION_API}/${this.sessionId}/query`, {
      method: 'POST',
      body: JSON.stringify({
        query: `SELECT * FROM ${this.params.schema}.${this.params.table}`
      }),
      headers:{
        'Content-Type': 'application/json'
      }
    })
    .then(result => result.json())
    .then(parsedResult => {
      if(parsedResult.rows && parsedResult.fields) {
        this.sqlResult = parsedResult;
      }
      this.requestUpdate();
    });
  }

  render() {
    if(!this.isVisible) {
      return null;
    }

    return html`
      ${this.externalStyles}
      <div class="sqlQueryTableContainer">
        <sql-query-table .sqlResult=${this.sqlResult} />
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
      .sqlQueryTableContainer {
        overflow: auto;
        width: 100%;
        font-size: 12px;
        border: 1px solid var(--alternate-highlight-color-dark);
      }
    `;
  }
}

window.customElements.define('sql-table-tab', SqlTableTab);