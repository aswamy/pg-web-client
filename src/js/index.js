import { ConnectionService } from './services/connection_service.js';

const $TAB_MENU = document.querySelector('tab-menu');

async function main() {

  const connection = await ConnectionService.createConnection();

  let sideMenu = document.createElement('side-menu');
  sideMenu.setAttribute('session-id', connection.id);

  let homeTab = document.createElement('home-tab');
  homeTab.setAttribute('session-id', connection.id);
  homeTab.setAttribute('tab-id', 0);
  homeTab.setAttribute('is-visible', '');
  homeTab.classList.add("mainContent-viewableTab");

  sideMenu.addEventListener('select-schema-table', (event) => {
    if(event.detail) {
      homeTab.setAttribute('selected-schema', event.detail.schema);
      homeTab.setAttribute('selected-table', event.detail.table);
    } else {
      homeTab.removeAttribute('selected-schema');
      homeTab.removeAttribute('selected-table');
    }
  });

  document.querySelector('#sidebarWrapper').appendChild(sideMenu);
  document.querySelector('#mainContent > div').appendChild(homeTab);
}

$TAB_MENU.onNewTab = function(tabId, tabType, params = {}) {

  let tabElement = null;

  if(tabType == 'SQL Query') {
    tabElement = document.createElement('sql-query-tab');
  } else if (tabType == 'SQL Table') {
    tabElement = document.createElement('sql-table-tab');
  } else {
    return;
  }

  tabElement.tabId = tabId;
  tabElement.className = 'mainContent-viewableTab';
  tabElement.params = params;

  document.querySelector('#mainContent > div').appendChild(tabElement);
}

$TAB_MENU.onSelectTab = function(tabId) {
  document.querySelectorAll('.mainContent-viewableTab').forEach(element => {
    if(element.tabId == tabId) {
      element.setAttribute('is-visible', '');
    } else {
      element.removeAttribute('is-visible');
    }
  });
}

$TAB_MENU.onDeleteTab = function(tabId) {
  document.querySelectorAll('.mainContent-viewableTab').forEach(element => {
    if(element.tabId == tabId) {
      element.releaseDatabaseSession();
      element.parentNode.removeChild(element);
      return;
    }
  });
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
