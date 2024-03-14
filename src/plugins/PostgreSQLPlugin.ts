import pgPromise, { IDatabase } from "pg-promise";
import { DatabasePlugin } from "./DatabasePlugin";

export class PostgreSQLPlugin implements DatabasePlugin {
  private _client: IDatabase<any>;

  async connect(connectionString: string): Promise<void> {
    const pgp = pgPromise();
    this._client = pgp(connectionString);
  }

  async reset(database: string): Promise<void> {
    if (!this._client) {
      throw new Error("Not connected to a database");
    }

    await this._client.none("DROP SCHEMA public CASCADE");
    await this._client.none("CREATE SCHEMA public");
  }

  async disconnect(): Promise<void> {}

  async insert(tableName: string, data: Record<string, any>[]): Promise<void> {
    if (!this._client) {
      throw new Error("Not connected to a database");
    }

    for (const row of data) {
      const fields = Object.keys(row).join(", ");
      const placeholders = Object.keys(row)
        .map((_, index) => `$${index + 1}`)
        .join(", "); // Creates placeholders like $1, $2
      const values = Object.values(row);
      const query = `INSERT INTO ${tableName} (${fields}) VALUES (${placeholders});`;
      await this._client.none(query, values); // Pass values as the second parameter for parameterized query
    }
  }

  get client(): IDatabase<any> {
    if (!this._client) {
      throw new Error("Not connected to a database");
    }
    return this._client;
  }
}
