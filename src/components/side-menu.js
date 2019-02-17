import { LitElement, html } from 'lit-element';

class SideMenu extends LitElement {

  constructor() {
    super();

    this.schemaMap = null;

    /*
    * Schema + tables/functions opened by the user
    * {
    *   <Schema Name> : {
    *     "table" : <boolean>,
    *     "function" : <boolean>
    *   },
    *   ...
    * }
    */
    this.selectedSchemaMap = {};

    this._schemaSubcategories = ['function', 'table'];
  }

  static get properties() {
    return {
      _sessionId: { type: String },

      schemaMap: { type: Object, attribute: false },
      selectedSchemaMap: { type: Object, attribute: false }
    }
  }

  set sessionId(id) {
    this._sessionId = id;

    this.fetchSchemas();
  }

  get sessionId() {
    return this._sessionId;
  }

  getSchemaNames(filterUserCreated) {
    if(!this.schemaMap) {
      return [];
    }

    return Object.keys(this.schemaMap).sort().filter(schemaName =>
      filterUserCreated === (!schemaName.startsWith('pg_') && schemaName !== 'information_schema')
    );
  }

  async fetchSchemas() {

    const schemasResponse = await fetch(`${CONNECTION_API}/${this.sessionId}/schemas`);
  
    if(!schemasResponse.ok) {
      return;
    }
    
    this.schemaMap = await schemasResponse.json();
  }

  _onSchemaClick(schemaName) {
    if(this.selectedSchemaMap.hasOwnProperty(schemaName)) {
      delete this.selectedSchemaMap[schemaName];
      this.selectedSchemaMap = { ...this.selectedSchemaMap };
    } else {
      this.selectedSchemaMap = { ...this.selectedSchemaMap, [schemaName] : { "table": true, "function": false } };
    }
  }

  _onSchemaSubcategoryClick(schemaName, subcategory) {
    if(this.selectedSchemaMap.hasOwnProperty(schemaName)) {
      this.selectedSchemaMap[schemaName][subcategory] = !this.selectedSchemaMap[schemaName][subcategory];
      this.selectedSchemaMap = { ...this.selectedSchemaMap };
    }
  }

  render() {
    return html`
      ${this.htmlStyle}
      <aside class="menu">
        <p class="menu-label">Schemas</p>
        <div id="pgSchemas">
          ${this.schemaMap ? null : html`<div class="lds-dual-ring"></div>` }
          <ul class="menu-list animated fadeIn">
            ${
              this.getSchemaNames(true).map(schemaName => {
                return html`<li>
                  <a @click="${this._onSchemaClick.bind(this, schemaName)}" class="menuItemLink">${schemaName}</a>
                  ${
                    this.selectedSchemaMap[schemaName] ? html`
                      ${
                        this._schemaSubcategories.map(subcategory => {
                          return html`
                          <ul>
                            <p @click=${this._onSchemaSubcategoryClick.bind(this, schemaName, subcategory)} class="menu-label">${subcategory} (${this.schemaMap[schemaName][subcategory].length})</p>
                            ${
                              this.selectedSchemaMap[schemaName][subcategory] ?
                              this.schemaMap[schemaName][subcategory].map(subcategoryName => html`<li><a class="menuItemLink">${subcategoryName}</a></li>`) :
                              null
                            }
                          </ul>`;
                        })
                      }` :
                    null
                  }
                </li>`;
              })
            }
          </ul>
        </div>
        <!--
        <p class="menu-label">Users</p>
        <div id="pgUsers">
          <div class="lds-dual-ring"></div>
          <ul class="menu-list animated fadeIn"></ul>
        </div>
        -->
      </aside>
    `;
  }

  get htmlStyle() {
    return html`
    <link rel="stylesheet" href="/libs/bulma/bulma.min.css">
    <link rel="stylesheet" href="/css/loading.css">
    <style>
      aside {
        user-select: none;
      }
      aside.menu {
        font-size: 0.9rem;
        margin: .75rem;
      }
      aside.menu .menu-label {
        margin: 1em 0em 0.5em 0em;
      }
      aside .menu-list a {
        padding: .25em .25em;
      }
      aside .menu-list ul {
        margin: .25em;
      }
      aside .menu-list p {
        cursor: pointer;
      }
      #pgSchemas {
        margin-bottom: 1.5em;
      }
    </style>
    `;
  }
}

window.customElements.define('side-menu', SideMenu);