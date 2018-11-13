const connectionAPI = '/api/connections';

const normalMenuItemTemplate = document.querySelector('#menuItem--normal');
const emphasizedMenuItemTemplate = document.querySelector('#menuItem--emphasized');

async function main() {
  
  const connectionResponse = await fetch(connectionAPI, {
    method: 'POST',
    body: JSON.stringify({
        user: 'mw5',
        host: 'localhost',
        database: 'mw5',
        password: 'mw5',
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

  refreshUsers(connection.id);
  refreshSchemas(connection.id);
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

    document.querySelector("#pgUsers ul").appendChild(menuItemElement);
  }

  document.querySelector("#pgUsers div").style.display = 'none';
}

async function refreshSchemas(id) {

  const schemasResponse = await fetch(`${connectionAPI}/${id}/schemas`);

  if(!schemasResponse.ok) {
    return;
  }

  const schemas = await schemasResponse.json();

  let defaultSchemas = [];
  let createdSchemas = [];

  for(let schema of schemas) {
    if(schema.startsWith('pg_')) {
      defaultSchemas.push(schema);
    } else {
      createdSchemas.push(schema);
    }
  }

  for(let schema of createdSchemas) {
    let menuItemElement = document.importNode(normalMenuItemTemplate.content, true);

    menuItemElement.querySelectorAll('a')[0].textContent = schema;

    document.querySelector("#pgSchemas ul").appendChild(menuItemElement);
  }

  for(let schema of defaultSchemas) {
    let menuItemElement = document.importNode(emphasizedMenuItemTemplate.content, true);

    menuItemElement.querySelectorAll('a')[0].textContent = schema;

    document.querySelector("#pgSchemas ul").appendChild(menuItemElement);
  }

  document.querySelector("#pgSchemas div").style.display = 'none';
}

main();

