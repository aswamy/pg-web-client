const _HOST = '127.0.0.1';
const _DATABASE = 'pg_web_client_test_db';
const _USER = 'pg_web_client';
const _PASSWORD = 'pg_web_client';

const OPEN_CONNECTIONS = {};

function getConnectionSpecification() {
  return {
    user: _USER,
    host: _HOST,
    database: _DATABASE,
    password: _PASSWORD,
    port: 5432,
    statement_timeout: 90000,
  };
}

async function createConnection() {

  const connectionResponse = await fetch(CONNECTION_API, {
    method: 'POST',
    body: JSON.stringify(getConnectionSpecification()),
    headers:{
      'Content-Type': 'application/json'
    }
  });
  
  if(!connectionResponse.ok) {
    return;
  }

  const connection = await connectionResponse.json();

  OPEN_CONNECTIONS[connection.id] = connection;

  return connection;
}

async function destroyConnection(id) {
  
  const connectionResponse = await fetch(`${CONNECTION_API}/${id}`, {
    method: 'DELETE'
  });

  if(!connectionResponse.ok) {
    console.error(`Could not destroy connection ${id}`);
    return;
  }

  delete OPEN_CONNECTIONS[id];

  console.log(`Deleted connection ${id}`);
}

async function destroyAllConnections() {
  for (let connectionId of Object.keys(OPEN_CONNECTIONS)) {
    await destroyConnection(connectionId);
  }
}