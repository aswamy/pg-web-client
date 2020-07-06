import { html } from 'lit-element';

function renderSqlTable(sqlResult) {
  return html`
    <style>
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
    </style>
    <table class="table is-bordered is-striped is-narrow">
      <thead>
        <tr>
          ${sqlResult.fields.map(field => html`<th>${field.name}</th>`)}
        </tr>
      </thead>
      <tbody>
        ${
          sqlResult.rows.map(row => {
            return html`<tr>${sqlResult.fields.map(field => {
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
  `
}

export { renderSqlTable };