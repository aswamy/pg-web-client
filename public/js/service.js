_HOST = '127.0.0.1';
_DATABASE = 'testdb';
_USER = 'test';
_PASSWORD = 'test';

CONNECTION_API = '/api/connections';
OPEN_CONNECTIONS = {};

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

  console.log(`Deleted connection ${id}`);
}

async function destroyAllConnections() {
  for (let connectionId of Object.keys(OPEN_CONNECTIONS)) {
    await destroyConnection(connectionId);
  }
}