const SQL_QUERY_HISTORY_SIZE = 10;
const SQL_QUERY_HISTORY_STORAGE_KEY = "SQL_QUERY_HISTORY";

function getSqlQueryHistory() {
  const sqlQueryHistory = localStorage.getItem(`${_DATABASE}:${SQL_QUERY_HISTORY_STORAGE_KEY}`);

  if(sqlQueryHistory) {
    return JSON.parse(sqlQueryHistory);
  }

  return new Array();
}

function prependSqlQueryHistory(query) {

  /*
  * If you ran a query that you already did in the past, instead of just adding it
  * to history, take the old entry out of the history, and place it in the most
  * recent history
  */
  let sqlQueryHistory = [query, ...getSqlQueryHistory(_DATABASE).filter(q => q != query)].splice(0, SQL_QUERY_HISTORY_SIZE);

  localStorage.setItem(`${_DATABASE}:${SQL_QUERY_HISTORY_STORAGE_KEY}`, JSON.stringify(sqlQueryHistory));
}