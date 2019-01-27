const normalMenuItemTemplate = document.querySelector('#menuItem--normal');
const emphasizedMenuItemTemplate = document.querySelector('#menuItem--emphasized');

let SESSION_ID = null;

async function main() {
  
  const connectionResponse = await fetch(CONNECTION_API, {
    method: 'POST',
    body: JSON.stringify({
        user: _USER,
        host: _HOST,
        database: _DATABASE,
        password: _PASSWORD,
        port: 5432,
        statement_timeout: 90000,
      }),
    headers:{
      'Content-Type': 'application/json'
    }
  });
  
  if(!connectionResponse.ok) {
    return;
  }

  const connection = await connectionResponse.json();

  SESSION_ID = connection.id;

  document.getElementsByTagName('side-menu')[0].sessionId = SESSION_ID;

  document.querySelectorAll('.mainContent-viewableTab').forEach(domElement => {
    domElement.sessionId = SESSION_ID;
  });
}

document.getElementsByTagName('tab-menu')[0].onNewTab = function(tabId, query = '') {
  let sqlQueryTabElement = document.createElement('sql-query-tab');
  sqlQueryTabElement.tabId = tabId;
  sqlQueryTabElement.sessionId = SESSION_ID;
  sqlQueryTabElement.className = 'mainContent-viewableTab';
  sqlQueryTabElement.sqlQuery = query;

  document.querySelector('#mainContent > div').appendChild(sqlQueryTabElement);
}

document.getElementsByTagName('tab-menu')[0].onSelectTab = function(tabId) {
  document.querySelectorAll('.mainContent-viewableTab').forEach(element => {
    if(element.tabId == tabId) {
      element.setAttribute('is-visible', '');
    } else {
      element.removeAttribute('is-visible');
    }
  });
}

document.getElementsByTagName('tab-menu')[0].onDeleteTab = function(tabId) {
  document.querySelectorAll('.mainContent-viewableTab').forEach(element => {
    if(element.tabId == tabId) {
      element.parentNode.removeChild(element);
      return;
    }
  });
}

main();

window.onbeforeunload = function() { return true };