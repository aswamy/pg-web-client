const PORT = 3000;

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const PGSessionManager = require('./pg_session_manager');

const app = express();
const sessionManager = new PGSessionManager();

app.use(bodyParser.json());
app.use('/', express.static(path.join(__dirname, '../public')));
app.use('/libs/bulma/', express.static(path.join(__dirname, '../node_modules/bulma/css'), {
  maxAge: '1d'
}));

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
  
});

app.get('/api/connections/:id/schemas', async function(req, res) {

  const client = sessionManager.get(req.params.id);

  /*
  * TODO: Use information_schema.tables and information_schema.routines
  * so we don't need to lazy load everything pointlessly
  */
  const result = await client.query('SELECT schema_name FROM information_schema.schemata ORDER BY schema_name');

  res.send(result.rows.map(row => row.schema_name));
});

app.get('/api/connections/:id/users', async function(req, res) {

  const client = sessionManager.get(req.params.id);

  const result = await client.query('SELECT usename FROM pg_user ORDER BY usename');

  res.send(result.rows.map(row => row.usename));
});

app.listen(PORT, () => console.log(`App started http://localhost:${PORT}`));
