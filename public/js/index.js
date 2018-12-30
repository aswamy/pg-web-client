const connectionAPI = '/api/connections';

const normalMenuItemTemplate = document.querySelector('#menuItem--normal');
const emphasizedMenuItemTemplate = document.querySelector('#menuItem--emphasized');

let SESSION_ID = null;

async function main() {
  
  const connectionResponse = await fetch(connectionAPI, {
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

  refreshUsers(SESSION_ID);
  refreshSchemas(SESSION_ID);

  document.querySelectorAll('.mainContent-viewableTab').forEach(domElement => {
    domElement.sessionId = SESSION_ID;
  });
}

async function refreshUsers(id) {

  const usersResponse = await fetch(`${connectionAPI}/${id}/users`);

  if(!usersResponse.ok) {
    return;
  }

  const users = await usersResponse.json();

  for(let user of users) {
    let menuItemElement = document.importNode(normalMenuItemTemplate.content, true);

    menuItemElement.querySelectorAll('a')[0].textContent = user;

    document.querySelector('#pgUsers ul').appendChild(menuItemElement);
  }

  document.querySelector('#pgUsers div').style.display = 'none';
}

async function refreshSchemas(id) {

  const schemasResponse = await fetch(`${connectionAPI}/${id}/schemas`);

  if(!schemasResponse.ok) {
    return;
  }

  const schemas = await schemasResponse.json();

  let defaultSchemaNames = [];
  let createdSchemaNames = [];

  const sortedSchemaNames = Object.keys(schemas).sort();

  for(let schemaName of sortedSchemaNames) {
    if(schemaName.startsWith('pg_')) {
      defaultSchemaNames.push(schemaName);
    } else {
      createdSchemaNames.push(schemaName);
    }
  }

  for(let schemaName of createdSchemaNames) {
    
    let menuItemElement = document.importNode(normalMenuItemTemplate.content, true);

    menuItemElement.querySelectorAll('a')[0].textContent = schemaName;

    for(let pgType of Object.keys(schemas[schemaName])) {
      
      let submenu = document.createElement('ul');

      let submenuName = document.createElement('p');
      submenuName.className = 'menu-label';
      submenuName.textContent = `${pgType} (${schemas[schemaName][pgType].length})`;

      submenu.appendChild(submenuName);

      menuItemElement.querySelectorAll('li')[0].appendChild(submenu);

      for(let type of schemas[schemaName][pgType]) {
        
        let submenuItemElement = document.importNode(normalMenuItemTemplate.content, true);

        submenuItemElement.querySelectorAll('a')[0].textContent = type;

        submenu.appendChild(submenuItemElement);
      }
    }

    document.querySelector('#pgSchemas ul').appendChild(menuItemElement);
  }

  document.querySelector('#pgSchemas div').style.display = 'none';
}

function setupHotkeys() {

  document.querySelector('#newTabLink').onclick = function() {

    let existingTabs = document.querySelectorAll('.mainContent-viewableTab').forEach(element => {
      element.removeAttribute('is-visible');
    });
    
    let sqlQueryTabElement = document.createElement('sql-query-tab');
    sqlQueryTabElement.sessionId = SESSION_ID;
    sqlQueryTabElement.className = 'mainContent-viewableTab';
    sqlQueryTabElement.setAttribute('is-visible', '');

    document.querySelector('#mainContent > div').appendChild(sqlQueryTabElement);
  }
}

main();
setupHotkeys();
