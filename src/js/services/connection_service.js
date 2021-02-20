const CONNECTION_API = '/api/connections';

class ConnectionService {

  constructor() {
    // TODO: let the user set these credentials
    this.host = '127.0.0.1';
    this.database = 'pg_web_client_demo';
    this.user = 'pg_web_client';
    this.password = 'pg_web_client';
    
    this.openConnections = {};
  }

  async createConnection() {
    const connectionResponse = await fetch(CONNECTION_API, {
      method: 'POST',
      body: JSON.stringify(
        {
          user: this.user,
          host: this.host,
          database: this.database,
          password: this.password,
          port: 5432,
          statement_timeout: 90000,
        }
      ),
      headers:{
        'Content-Type': 'application/json'
      }
    });
    
    if(!connectionResponse.ok) {
      return;
    }
  
    const connection = await connectionResponse.json();
  
    this.openConnections[connection.id] = connection;
  
    return connection;
  }
  
  async destroyConnection(id) {
    const connectionResponse = await fetch(`${CONNECTION_API}/${id}`, {
      method: 'DELETE'
    });
  
    if(!connectionResponse.ok) {
      console.error(`Could not destroy connection ${id}`);
      return;
    }
  
    delete this.openConnections[id];
  
    console.log(`Deleted connection ${id}`);
  }
  
  async destroyAllConnections() {
    for (let connectionId of Object.keys(this.openConnections)) {
      await destroyConnection(connectionId);
    }
  }  
};

const service = new ConnectionService();

export { CONNECTION_API, service as ConnectionService };
