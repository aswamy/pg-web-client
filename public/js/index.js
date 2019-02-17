async function main() {
  
  const connection = await createConnection();

  $SIDE_MENU.sessionId = connection.id;
  $HOME_TAB.sessionId = connection.id;
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

$SIDE_MENU.onViewTable = function(tableName) {
  let sqlTableTabElement = document.createElement('sql-table-tab');
  sqlQueryTabElement.tabId = tabId;
  sqlQueryTabElement.className = 'mainContent-viewableTab';
  sqlQueryTabElement.sqlQuery = query;

  document.querySelector('#mainContent > div').appendChild(sqlQueryTabElement);
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
  destroyAllConnections();
});


main();
