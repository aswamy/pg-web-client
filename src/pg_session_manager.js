const { Pool, Client } = require('pg');
const crypto = require('crypto');

class PGSessionManager {
  
  constructor() {
    this.sessions = {};
  }

  connect(params) {
    
    const client = new Client(params);

    return client.connect()
      .then(() => {
        const id = crypto.randomBytes(16).toString("hex");

        this.sessions[id] = client;

        return { id };
      });
  }
  
  disconnect(id) {
    
    if(!this.sessions.hasOwnProperty(id)) {
      return Promise.reject();
    }

    return this.sessions[id].end();
  }

  get(id) {

    if(!this.sessions.hasOwnProperty(id)) {
      throw Error(`Session ${id} does not exist.`);
    }

    return this.sessions[id];
  }
}

module.exports = PGSessionManager;