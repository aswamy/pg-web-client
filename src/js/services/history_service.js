import { ConnectionService } from './connection_service.js';

class HistoryService {

  constructor() {
    this.sqlQueryHistorySize = 10;
    this.sqlQueryHistoryStorageKey = "SQL_QUERY_HISTORY";
  }

  getSqlQueryHistory() {
    const sqlQueryHistory = localStorage.getItem(`${ConnectionService.database}:${this.sqlQueryHistoryStorageKey}`);
  
    if(sqlQueryHistory) {
      return JSON.parse(sqlQueryHistory);
    }
  
    return new Array();
  }
  
  prependSqlQueryHistory(query) {
  
    /*
    * If you ran a query that you already did in the past, instead of just adding it
    * to history, take the old entry out of the history, and place it in the most
    * recent history
    */
    let sqlQueryHistory = [query, ...this.getSqlQueryHistory(ConnectionService.database).filter(q => q != query)].splice(0, this.sqlQueryHistorySize);
  
    localStorage.setItem(`${ConnectionService.database}:${this.sqlQueryHistoryStorageKey}`, JSON.stringify(sqlQueryHistory));
  }
}

export default new HistoryService();