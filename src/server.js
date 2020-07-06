const PORT = 3000;

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const PGSessionManager = require('./pg_session_manager');

const app = express();
const sessionManager = new PGSessionManager();

app.use(bodyParser.json());
app.use('/', express.static(path.join(__dirname, '../dist')));

/*
* REQUEST PAYLOAD:
* {
*   user: [String],
*   host: [String],
*   database: [String],
*   password: [String],
*   port: [Number],
*   statement_timeout: [Number]
* }
*/
app.post('/api/connections', function(req, res) {
  sessionManager.connect(req.body)
    .then((result) => res.send(result))
    .catch(() => {
      res.status(500).end();
    });
});

app.get('/api/connections/:id', function(req, res) {

});

app.put('/api/connections/:id', function(req, res) {
  
});

app.delete('/api/connections/:id', function(req, res) {
  sessionManager.disconnect(req.params.id)
    .then((result) => res.send())
    .catch(() => {
      res.status(500).end();
    })
});

app.get('/api/connections/:id/schemas', async function(req, res) {

  const client = sessionManager.get(req.params.id);

  const result = await client.query(`
    SELECT table_schema as schema, table_name as name, 'table' as type FROM information_schema.tables WHERE table_type = 'BASE TABLE'
    UNION
    SELECT routine_schema as schema, routine_name as name, 'function' as type FROM information_schema.routines
    ORDER BY schema, type, name
  `);

  res.send(result.rows.reduce(function(groups, item) {

    if(!groups.hasOwnProperty(item.schema)) {
      groups[item.schema] = {
        function: [],
        table: []
      }
    }

    groups[item.schema][item.type].push(item.name);

    return groups;
  }, {}));
});

app.get('/api/connections/:id/users', async function(req, res) {

  const client = sessionManager.get(req.params.id);

  const result = await client.query('SELECT usename FROM pg_user ORDER BY usename');

  res.send(result.rows.map(row => row.usename));
});

/*
* REQUEST PAYLOAD:
* {
*    query: [String]
* }
*/
app.post('/api/connections/:id/query', function(req, res) {

  const client = sessionManager.get(req.params.id);

  /*
  * TODO: Instead of returning the result
  * we should be returning a handle to the query
  * so that we can manually kill it incase it takes
  * too long
  * 
  * TODO: Use PG Cursor so we can page results
  */
  client.query(req.body.query)
    .then(result => {
      res.send({
        rows: result.rows,
        fields: result.fields
      });
    })
    .catch(errResponse => {
      res.status(400);
      res.send({
        error: errResponse.toString() || "Could not run SQL command"
      });
    });
});

app.listen(PORT, () => console.log(`App started http://localhost:${PORT}`));