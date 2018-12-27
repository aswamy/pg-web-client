import { LitElement, html } from '@polymer/lit-element';

class SqlQueryTab extends LitElement {

    constructor() {
        super();

        this._onTextAreaFocus(4, 1);
    }

    static get properties() {
        return {
            visible: { type: Boolean },
            editorTextAreaSize: { type: Number },
            resultsTextAreaSize: { type: Number }
        }
    }

    static get EDITOR_TEXT_AREA_CLASS_NAME() {
        return 'sqlQueryTabEditor';
    }

    static get RESULTS_TEXT_AREA_CLASS_NAME() {
        return 'sqlQueryTabResults';
    }

    render() {

        if(!this.visible) {
            return;
        }

        return html`
            
            ${this.htmlStyle}

            <div id="mainContent-selectedTab">
                <div class="sqlQueryTabMenu"></div>
                <textarea style="flex-grow:${this.editorTextAreaSize}" @click="${this._onTextAreaFocus.bind(this, 4, 1)}" class="${(SqlQueryTab.EDITOR_TEXT_AREA_CLASS_NAME)}"></textarea>
                <textarea style="flex-grow:${this.resultsTextAreaSize}" @click="${this._onTextAreaFocus.bind(this, 1, 4)}" readonly class="${SqlQueryTab.RESULTS_TEXT_AREA_CLASS_NAME}"></textarea>
            </div>
        `;
    }

    _onTextAreaFocus(editorSize, resultsSize) {
        this.editorTextAreaSize = editorSize;
        this.resultsTextAreaSize = resultsSize;
    }

    get htmlStyle() {
        return html`
            <style>
            .sqlQueryTabMenu {
                height: 30px;
                background-color: #f5f5f5;
                border-color: #dbdbdb;
                border-style: solid;
                border-width: 1px 1px 0px 1px;
            }
            .sqlQueryTabEditor:focus, .sqlQueryTabResults:focus {
                outline: none !important;
            }
            .sqlQueryTabEditor, .sqlQueryTabResults {
                font-family: monospace;
                border: 1px solid #dbdbdb;
                resize: none;
                width: 100%;
                padding: 0.75rem;
            }
            .sqlQueryTabEditor {
                //flex-grow: 4;
            }
            .sqlQueryTabResults {
                //flex-grow: 1;
                margin-top: 10px;
            }
            #mainContent-selectedTab {
                flex-grow: 1;
                display: flex;
                flex-direction: column;
            }
            </style>`;
    }
}

window.customElements.define('sql-query-tab', SqlQueryTab);