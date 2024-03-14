export interface PostgreSQLClient {
  query: (sql: string, values?: any[]) => Promise<any>;
}
