export interface DatabasePlugin<T, U> {
  connect(connectionString: string): Promise<T>;
  disconnect(): Promise<void>;
  reset(database: string): Promise<void>;
  insert(tableName: string, data: Record<string, any>[]): Promise<void>;
  client: T;
  db: U;
}
