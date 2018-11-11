const PORT = 3000;

const path = require('path');
const express = require('express');
const app = express();

app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/libs/bulma/', express.static(path.join(__dirname, 'node_modules/bulma/css'), {
  maxAge: '1d'
}));

//app.get('/', (req, res) => res.send('hello world'));

app.listen(PORT, () => console.log(`App started http://localhost:${PORT}`));

//const { Pool, Client } = require('pg');