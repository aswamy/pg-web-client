import { LitElement, html } from '@polymer/lit-element';

class SqlQueryTab extends LitElement {

    constructor() {
        super();
    }

    static get properties() {
        return { }
    }

    render() {
        return html`
            <style>
            .sqlQueryTabMenu {
                height: 30px;
                background-color: #f5f5f5;
                border-color: #dbdbdb;
                border-style: solid;
                border-width: 1px 1px 0px 1px;
              }
              .sqlQueryTabEditor:focus {
                outline: none !important;
              }
              .sqlQueryTabEditor {
                font-family: monospace;
                border: 1px solid #dbdbdb;
                resize: none;
                width: 100%;
                padding: 0.75rem;
                flex-grow: 1;
              }
              .sqlQueryTabResults {
                height: 90px;
                margin-top: 10px;
                border: 1px solid #dbdbdb;
                padding: 0.75rem;
                cursor: text;
              }
              #mainContent-selectedTab {
                flex-grow: 1;
                display: flex;
                flex-direction: column;
              }
            </style>

            <div id="mainContent-selectedTab">
                <div class="sqlQueryTabMenu"></div>
                <textarea class="sqlQueryTabEditor"></textarea>
                <div class="sqlQueryTabResults"></div>
            </div>
        `;
    }
}

window.customElements.define('sql-query-tab', SqlQueryTab);