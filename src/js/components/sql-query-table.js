import { LitElement, html, css } from 'lit-element';

class SqlQueryTable extends LitElement {

  constructor() {
    super();
  }

  static get properties() {
    return {
      sqlResult: { type: Object },
      sqlError: { type: String }
    }
  }

  render() {
    if(!this.sqlResult) {
      return null;
    }

    if(this.sqlError) {
      return html`<div class="sqlQueryTabResultsErrorMessage">${this.sqlError}</div>`;
    }

    return html`
      ${this.externalStyles}
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

  get externalStyles() {
    return html`
      <link rel="stylesheet" href="/css/bulma.min.css">
    `;
  }

  static get styles() {
    return css`
      :host {
        font-family: monospace;
        font-size: 14px;
        margin-top: 10px;
        overflow: auto;
        position: relative;
      }
      table {
        margin: 0.75rem;
        display: inline-block;
      }
      th {
        background: white;
        position: sticky;
        top: -1;
        z-index: 10;
        padding: .5em .5em !important;
      }
      th, td {
        white-space: nowrap;
        max-width: 300px;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .sqlQueryTabResultsErrorMessage {
        margin: 0.75rem;
        display: inline-block;
      }
    `;
  }
}

window.customElements.define('sql-query-table', SqlQueryTable);