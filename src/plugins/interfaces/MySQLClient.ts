export interface MySQLClient {
  query: (sql: string, values?: any[]) => Promise<any>;
}
