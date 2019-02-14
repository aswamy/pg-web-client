const $tabMenu = document.querySelector('tab-menu');
const $sideMenu = document.querySelector('side-menu');
const $homeTab = document.querySelector('home-tab');

async function main() {
  
  const connection = await createConnection();

  $sideMenu.sessionId = connection.id;
  $homeTab.sessionId = connection.id;
}

$tabMenu.onNewTab = function(tabId, query = '') {
  let sqlQueryTabElement = document.createElement('sql-query-tab');
  sqlQueryTabElement.tabId = tabId;
  sqlQueryTabElement.className = 'mainContent-viewableTab';
  sqlQueryTabElement.sqlQuery = query;

  document.querySelector('#mainContent > div').appendChild(sqlQueryTabElement);
}

$tabMenu.onSelectTab = function(tabId) {
  document.querySelectorAll('.mainContent-viewableTab').forEach(element => {
    if(element.tabId == tabId) {
      element.setAttribute('is-visible', '');
    } else {
      element.removeAttribute('is-visible');
    }
  });
}

$tabMenu.onDeleteTab = function(tabId) {
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
  destroyAllConnections();
});


main();
