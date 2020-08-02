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
            <h1 class="title">${this.selectedSchema}</h1>
            <h2 class="subtitle">${this.selectedTable}</h2>
            <div class="table-container">
              <table class="table is-striped is-narrow is-bordered columnTable">
                <thead>
                  <tr>
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
            <p class="title is-4 mt-6">Constraints</p>
            ${this.renderConstraintTable()}
          `:
          html `
            <div><em>Select a table to display its meta-data</em></div>
          `
        }
      </div>
    `;
  }

  renderConstraintTable() {
    return html`
      <div class="table-container">
        <table class="constraintTable">
          ${
            Object.entries(this.groupConstraintsByConstraintName(this.tableDataToDisplay.primaryKeys)).map(([constraintName, constraints]) => {
              return html`
                <tbody>
                  ${constraints.map((constraint, index) => {
                    let constraintNameCell = null;

                    if(index == 0) {
                      constraintNameCell = html`
                        <td class="constraintTypeColumn" rowspan=${constraints.length}>
                          <div>PRIMARY KEY</div>
                          <div style="font-size: small"><em>${constraintName}</em></div>
                        </td>
                      `;
                    }
                    
                    return html`
                      <tr>
                        ${constraintNameCell}
                        <td class="constraintColumnName" colspan=2>
                          ${constraint.column_name}
                        </td>
                      </tr>
                    `;
                  })}
                </tbody>
              `;
            })
          }
          ${
            Object.entries(this.groupConstraintsByConstraintName(this.tableDataToDisplay.foreignKeys)).map(([constraintName, constraints]) => {
              return html`
                <tbody>
                  ${constraints.map((constraint, index) => {
                    let constraintNameCell = null;
                    if(index == 0) {
                      constraintNameCell = html`
                        <td class="constraintTypeColumn" rowspan=${constraints.length}>
                          <div>FOREIGN KEY</div>
                          <div style="font-size: small"><em>${constraintName}</em></div>
                        </td>
                      `;
                    }
                    return html`
                      <tr>
                        ${constraintNameCell}
                        <td class="constraintColumnName">
                          ${constraint.column_name}
                        </td>
                        <td class="foreignColumnName">
                          <a @click="${() => this.dispatchEvent(new CustomEvent('navigate-schema-table', { detail: { schema: constraint.foreign_table_schema, table: constraint.foreign_table_name } }))}">${`${constraint.foreign_table_schema}.${constraint.foreign_table_name} (${constraint.foreign_column_name})`}</a>
                        </td>
                      </tr>
                    `;
                  })}
                </tbody>
              `;
            })
          }
          ${
            Object.entries(this.groupConstraintsByConstraintName(this.tableDataToDisplay.uniqueConstraints)).map(([constraintName, constraints]) => {
              return html`
                <tbody>
                  ${constraints.map((constraint, index) => {
                    let constraintNameCell = null;
                    if(index == 0) {
                      constraintNameCell = html`
                        <td class="constraintTypeColumn" rowspan=${constraints.length}>
                          <div>UNIQUE</div>
                          <div style="font-size: small"><em>${constraintName}</em></div>
                        </td>
                      `;
                    }
                    return html`
                      <tr>
                        ${constraintNameCell}
                        <td class="constraintColumnName" colspan=2>
                          ${constraint.column_name}
                        </td>
                      </tr>
                    `;
                  })}
                </tbody>
              `;
            })
          }
          ${
            Object.entries(this.groupConstraintsByConstraintName(this.tableDataToDisplay.checkConstraints)).map(([constraintName, constraints]) => {
              return html`
                <tbody>
                  ${constraints.map((constraint, index) => {
                    let constraintNameCell = null;
                    let constraintClause = null;

                    if(index == 0) {
                      constraintNameCell = html`
                        <td class="constraintTypeColumn" rowspan=${constraints.length}>
                          <div>CHECK</div>
                          <div style="font-size: small"><em>${constraintName}</em></div>
                        </td>
                      `;
                      constraintClause = html`
                        <td class="checkClauseColumn" rowspan=${constraints.length}>
                          ${constraint.check_clause}
                        </td>
                      `;
                    }
                    return html`
                      <tr>
                        ${constraintNameCell}
                        <td class="constraintColumnName">
                          ${constraint.column_name}
                        </td>
                        ${constraintClause}
                      </tr>
                    `;
                  })}
                </tbody>
              `;
            })
          }
        </table>
      </div>
    `;
  }

  groupConstraintsByConstraintName(constraints) {
    return constraints.reduce((accumulator, constraint) => {
      if(!(constraint.constraint_name in accumulator)) {
        accumulator[constraint.constraint_name] = [];
      }
      accumulator[constraint.constraint_name].push(constraint);
      return accumulator;
    }, {});
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
        border: 1px solid var(--alternate-highlight-color-dark);
        padding: 0.75rem;
        width: 100%;
        overflow-y: auto;
      }
      table {
        white-space: nowrap;
        font-size: 0.9rem;
      }
      .constraintTable tbody:not(:last-child) {
        border-bottom: 1px solid var(--alternate-highlight-color-dark);
      }
      .constraintTable .constraintTypeColumn {
        padding: 0px 20px 10px 0px;
        min-width: 200px;
        width: 200px;
      }
      .constraintTable .constraintColumnName {
        padding: 0px 20px 10px 0px;
        min-width: 200px;
        width: 200px;
      }
      .constraintTable .foreignColumnName {
        padding: 0px 20px 10px 0px;
        min-width: 200px;
        width: 200px;
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