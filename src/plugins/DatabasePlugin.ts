export interface DatabasePlugin {
  connect(connectionString: string): Promise<void>;
  disconnect(): Promise<void>;
  reset(database: string): Promise<void>;
  insert(tableName: string, data: Record<string, any>[]): Promise<void>;
  client: any;
}
