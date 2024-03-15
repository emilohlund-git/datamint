import {
  DeleteQuery,
  FindQuery,
  InsertQuery,
  UpdateQuery,
} from "../plugins/types";

export interface DatabasePlugin {
  connect(connectionString: string): Promise<void>;
  disconnect(): Promise<void>;
  find(tableName: string, query: FindQuery): Promise<any>;
  update(tableName: string, query: UpdateQuery): Promise<any>;
  delete(tableName: string, query: DeleteQuery): Promise<any>;
  insert(tableName: string, query: InsertQuery): Promise<void>;
  reset(database: string): Promise<void>;
  createTable(tableName: string, schema?: object): Promise<any>;
  client: any;
}
