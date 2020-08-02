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

app.get('/api/connections/:id/schemas/:schema_name/tables/:table_name', async function(req, res) {

  const client = sessionManager.get(req.params.id);

  let schema = req.params.schema_name;
  let table = req.params.table_name;

  const columnQueryResult = await client.query(`
    SELECT
      c.column_name,
      c.data_type,
      c.character_maximum_length max_length,
      c.is_nullable,
      c.column_default default_value
    FROM
      information_schema.columns c
    WHERE
      table_schema = '${schema}'
      AND table_name = '${table}'
  `);

  const primaryKeyConstraintQueryResult = await client.query(`
    SELECT DISTINCT
      tc.constraint_name,
      kcu.column_name
    FROM
      information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    WHERE
      tc.constraint_type = 'PRIMARY KEY'
      AND tc.table_schema = '${schema}'
      AND tc.table_name = '${table}'
  `);

  const foreignKeyConstraintQueryResult = await client.query(`
    SELECT DISTINCT
      tc.constraint_name,
      kcu.column_name,
      ccu.table_schema AS foreign_table_schema,
      ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
    FROM
      information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
    WHERE
      constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = '${schema}'
      AND tc.table_name = '${table}'
  `);

  const uniqueConstraintQueryResult = await client.query(`
    SELECT DISTINCT
      tc.constraint_name,
      kcu.column_name
    FROM
      information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    WHERE
      tc.constraint_type = 'UNIQUE'
      AND tc.table_schema = '${schema}'
      AND tc.table_name = '${table}'
  `);

  const checkConstraintQueryResult = await client.query(`
    SELECT DISTINCT
      ccu.constraint_name,
      ccu.column_name,
      cc.check_clause
    FROM
      information_schema.constraint_column_usage ccu
      JOIN information_schema.check_constraints cc ON cc.constraint_name = ccu.constraint_name
    WHERE
      ccu.table_schema = '${schema}'
      AND ccu.table_name = '${table}'
  `);

  let result = columnQueryResult.rows
    .map(columnData => {
      let { is_nullable, ...result } = columnData;
      result.is_nullable = is_nullable == 'YES';

      return result;
    })
    .sort((columnA, columnB) => columnA.column_name.localeCompare(columnB.column_name));

  res.send({
    columns: result,
    primaryKeys: primaryKeyConstraintQueryResult.rows,
    foreignKeys: foreignKeyConstraintQueryResult.rows,
    uniqueConstraints: uniqueConstraintQueryResult.rows,
    checkConstraints: checkConstraintQueryResult.rows
  });
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
