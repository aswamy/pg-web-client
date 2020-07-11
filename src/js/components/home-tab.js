import { LitElement, css, html } from 'lit-element';

import { CONNECTION_API } from '../services/connection_service.js';

class HomeTab extends LitElement {

  constructor() {
    super();
  }

  static get properties() {
    return {
      tabId: { type: Number, attribute: 'tab-id' },
      isVisible: { type: Boolean, attribute: 'is-visible' },
      sessionId: { type: String, attribute: 'session-id' },

      selectedSchema: { type: String, attribute: 'selected-schema' },
      selectedTable: { type: String, attribute: 'selected-table' },

      tableDataToDisplay: { type: Object, attribute: false }
    }
  }

  render() {
    if(!this.isVisible) {
      return html``;
    }

    return html`
      ${this.externalStyles}
      <div class="homeTabWrapper">
        ${
          this.tableDataToDisplay ?
          html`
            <div class="table-container">
              <table class="table is-striped is-narrow is-bordered">
                <thead>
                  <tr>
                    <th></th>
                    <th>Column Name</th>
                    <th>Data Type</th>
                    <th>Default Value</th>
                    <th>Nullable?</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.tableDataToDisplay.columns.map(columnData =>
                    html`
                      <tr>
                        <td>${columnData.constraint_type}</td>
                        <td>${columnData.column_name}</td>
                        <td>${columnData.data_type == 'character varying' && columnData.max_length ? `${columnData.data_type}(${columnData.max_length})` : columnData.data_type}</td>
                        <td>${columnData.default_value}</td>
                        <td>${columnData.is_nullable ? '✓' : ''}</td>
                      </tr>
                    `
                  )}
                </tbody>
              </table>
            </div>
          ` : null
        }
      </div>
    `;
  }

  async updated(changedProperties) {
    if((changedProperties.has('selectedSchema') || changedProperties.has('selectedTable'))) {
      if(this.selectedSchema && this.selectedTable) {
        this.tableDataToDisplay = await this.fetchTableData();
      } else {
        this.tableDataToDisplay = null;
      }
    }
  }

  async fetchTableData() {
    const tableDataResponse = await fetch(`${CONNECTION_API}/${this.sessionId}/schemas/${this.selectedSchema}/tables/${this.selectedTable}`);
  
    if(!tableDataResponse.ok) {
      return;
    }
    
    return await tableDataResponse.json();
  }

  static get styles() {
    return css`
      .homeTabWrapper {
        border: 1px solid #dbdbdb;
        padding: 0.75rem;
        width: 100%;
      }
      table {
        white-space: nowrap;
        font-size: 0.9rem;
      }
    `;
  }

  get externalStyles() {
    return html`
    <link rel="stylesheet" href="/css/bulma.min.css">
    <link rel="stylesheet" href="/css/loading.css">
    `;
  }
}

window.customElements.define('home-tab', HomeTab);