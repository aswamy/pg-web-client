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
    .then((result) => {
      res.send(result);      
    })
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

app.get('/api/connections/:id/schemas', function(req, res) {
  //client.query('SELECT schema_name FROM information_schema.schemata', (err, res) => {
  //console.log(err, res);
  //client.end();
  //});
});

app.listen(PORT, () => console.log(`App started http://localhost:${PORT}`));
