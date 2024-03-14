import mysql from "mysql2/promise";
import { DatabasePlugin } from "./DatabasePlugin";

export class MySQLPlugin implements DatabasePlugin {
  private _client: mysql.Connection | null = null;

  async connect(connectionString: string): Promise<void> {
    try {
      this._client = await mysql.createConnection(connectionString);
      await this._client.connect();
    } catch (error) {
      this._client = null;
      throw error;
    }
  }

  async reset(database: string): Promise<void> {
    if (!this._client) {
      throw new Error("Not connected to a database");
    }

    await this._client.query(`DROP DATABASE IF EXISTS ${database}`);
    await this._client.query(`CREATE DATABASE ${database}`);
  }

  async disconnect(): Promise<void> {
    if (this._client) {
      await this._client.end();
      this._client = null;
    }
  }

  async insert(tableName: string, data: Record<string, any>[]): Promise<void> {
    if (!this._client) {
      throw new Error("Not connected to a database");
    }

    for (const row of data) {
      const fields = Object.keys(row).join(", ");
      const placeholders = Object.keys(row)
        .map(() => "?")
        .join(", ");
      const values = Object.values(row);
      const query = `INSERT INTO ${tableName} (${fields}) VALUES (${placeholders});`;
      await this._client.query(query, values);
    }
  }

  get client(): mysql.Connection {
    if (!this._client) {
      throw new Error("Not connected to a database");
    }
    return this._client;
  }
}
