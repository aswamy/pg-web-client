import { ConnectionService } from './services/connection_service.js';

async function main() {
  const connection = await ConnectionService.createConnection();

  let contextMenu = createContextMenuElement();

  let homeTab = createHomeTabElement(connection);
  let sideMenu = createSideMenuElement(connection, homeTab, contextMenu);
  let tabMenu = createTabMenuElement();

  document.querySelector('#sidebarWrapper').appendChild(sideMenu);
  document.querySelector('#mainContent > div').appendChild(tabMenu);
  document.querySelector('#mainContent > div').appendChild(homeTab);

  let body = document.getElementsByTagName("body")[0];
  body.insertBefore(contextMenu, body.childNodes[0]);
}

function createContextMenuElement() {
  let contextMenu = document.createElement('context-menu');
  return contextMenu;
}

function createHomeTabElement(connection) {
  let homeTab = document.createElement('home-tab');
  homeTab.setAttribute('session-id', connection.id);
  homeTab.setAttribute('tab-id', 0);
  homeTab.setAttribute('is-visible', '');
  homeTab.classList.add("mainContent-viewableTab");
  return homeTab;
}

function createTabMenuElement() {
  let tabMenu = document.createElement('tab-menu');

  tabMenu.addEventListener('new-tab', (event) => {
    let tabElement = null;
    if(event.detail.tabType == 'SQL Query') {
      tabElement = document.createElement('sql-query-tab');
    } else if(event.detail.tabType == 'SQL Table') {
      tabElement = document.createElement('sql-table-tab');
    } else {
      return;
    }
    tabElement.setAttribute('tab-id', event.detail.tabId);
    tabElement.classList.add("mainContent-viewableTab");
    tabElement.params = event.detail.params;
    document.querySelector('#mainContent > div').appendChild(tabElement);
    tabMenu.selectTab(event.detail.tabId);
  });
  tabMenu.addEventListener('select-tab', (event) => {
    document.querySelectorAll('.mainContent-viewableTab').forEach(element => {
      if(element.tabId == event.detail.tabId) {
        element.setAttribute('is-visible', '');
      } else {
        element.removeAttribute('is-visible');
      }
    });
  });
  tabMenu.addEventListener('delete-tab', (event) => {
    document.querySelectorAll('.mainContent-viewableTab').forEach(element => {
      if(element.tabId == event.detail.tabId) {
        element.releaseDatabaseSession();
        element.parentNode.removeChild(element);
        return;
      }
    });
  });
  return tabMenu;
}

function createSideMenuElement(connection, homeTab, contextMenu) {
  let sideMenu = document.createElement('side-menu');
  sideMenu.setAttribute('session-id', connection.id);
  sideMenu.addEventListener('select-schema-table', (event) => {
    if(event.detail) {
      homeTab.setAttribute('selected-schema', event.detail.schema);
      homeTab.setAttribute('selected-table', event.detail.table);
    } else {
      homeTab.removeAttribute('selected-schema');
      homeTab.removeAttribute('selected-table');
    }
  });
  sideMenu.addEventListener('select-table-context-menu', (event) => {
    contextMenu.constructContextMenu(event.detail.coordinates, event.detail.options);
  });
  return sideMenu;
}

/**
 * Handlers to close connections before exiting
 */
window.addEventListener('beforeunload', function (e) {
  e.preventDefault();
  e.returnValue = 'confirm';
});

/**
 * This won't entirely work because when you are leaving a page
 * all REST requests will be cancelled. This means that
 * the database connections will still stay alive. One way to
 * prevent this is to have a WebSocket; This way, the server will close
 * the connections once the WebSocket is broken.
 */
window.addEventListener('unload', function (e) {
  e.preventDefault();
  ConnectionService.destroyAllConnections();
});

main();
