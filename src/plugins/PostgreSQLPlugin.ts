import { Client } from "pg";
import { DatabasePlugin } from "./DatabasePlugin";

export class PostgreSQLPlugin implements DatabasePlugin {
  private _client: Client;

  async connect(connectionString: string): Promise<void> {
    this._client = new Client(connectionString);
    await this._client.connect();
  }

  async reset(database: string): Promise<void> {
    if (!this._client) {
      throw new Error("Not connected to a database");
    }

    await this._client.query("DROP SCHEMA public CASCADE");
    await this._client.query("CREATE SCHEMA public");
  }

  async disconnect(): Promise<void> {
    if (this._client) {
      await this._client.end();
    }
  }

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
      await this._client.query(query, values); // Pass values as the second parameter for parameterized query
    }
  }

  get client(): Client {
    if (!this._client) {
      throw new Error("Not connected to a database");
    }
    return this._client;
  }
}
