import {
  DeleteQuery,
  FindQuery,
  InsertQuery,
  UpdateQuery,
} from "../plugins/types";
import { DatabasePlugin } from "./DatabasePlugin";

export abstract class BasePlugin<T> implements DatabasePlugin {
  protected _client: T;

  protected ensureConnection(): void {
    if (!this._client) {
      throw new Error("Not connected to a database");
    }
  }

  get client(): T {
    this.ensureConnection();
    return this._client;
  }

  abstract connect(connectionString: string): Promise<void>;
  abstract reset(database: string): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract find(collectionName: string, query: FindQuery): Promise<any[]>;
  abstract update(collectionName: string, query: UpdateQuery): Promise<any>;
  abstract delete(collectionName: string, query: DeleteQuery): Promise<any>;
  abstract insert(collectionName: string, data: InsertQuery): Promise<any>;
  abstract createTable(collectionName: string, schema?: object): Promise<void>;

  protected objectToSql(query: object): string {
    return Object.entries(query)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          const escapedValues = value
            .map((v) => this.escapeValue(v))
            .join(", ");
          return `${key} IN (${escapedValues})`;
        } else {
          return `${key} = ${this.escapeValue(value)}`;
        }
      })
      .join(" AND ");
  }

  protected abstract escapeValue(value: any): string;
}
