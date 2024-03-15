import mysql from "mysql2/promise";
import { DatabasePlugin } from "./DatabasePlugin";
import { DeleteQuery, FindQuery, InsertQuery, UpdateQuery } from "./types";

export class MySQLPlugin implements DatabasePlugin {
  private _client: mysql.Connection;

  async connect(connectionString: string): Promise<void> {
    try {
      this._client = await mysql.createConnection(connectionString);
      await this._client.connect();
    } catch (error) {
      throw error;
    }
  }

  async reset(database: string): Promise<void> {
    this.ensureConnection();

    await this._client.query(`DROP DATABASE IF EXISTS ${database}`);
    await this._client.query(`CREATE DATABASE ${database}`);
  }

  async disconnect(): Promise<void> {
    if (this._client) {
      await this._client.end();
    }
  }

  async find(tableName: string, query: FindQuery): Promise<any> {
    this.ensureConnection();

    const sql = `SELECT * FROM ${tableName} WHERE ${this.objectToSql(query)}`;
    const [rows] = (await this._client?.query(sql)) as [
      mysql.RowDataPacket[],
      mysql.FieldPacket[]
    ];
    return rows;
  }

  async update(tableName: string, query: UpdateQuery): Promise<any> {
    this.ensureConnection();

    const sql = `UPDATE ${tableName} SET ${this.objectToSql(
      query.update
    )} WHERE ${this.objectToSql(query.filter)}`;
    const [result] = (await this._client?.query(sql)) as [
      mysql.RowDataPacket[],
      mysql.FieldPacket[]
    ];
    return result;
  }

  async delete(tableName: string, query: DeleteQuery): Promise<any> {
    this.ensureConnection();

    const sql = `DELETE FROM ${tableName} WHERE ${this.objectToSql(query)}`;
    const [result] = (await this._client?.query(sql)) as [
      mysql.RowDataPacket[],
      mysql.FieldPacket[]
    ];
    return result;
  }

  private objectToSql(query: object): string {
    return Object.entries(query)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          const values = value.map((v) => mysql.escape(v)).join(", ");
          return `${key} IN (${values})`;
        } else {
          return `${key} = ${mysql.escape(value)}`;
        }
      })
      .join(" AND ");
  }

  async truncate(tableName: string) {
    this.ensureConnection();

    await this._client.query(`TRUNCATE TABLE ${tableName}`);
  }

  async insert(tableName: string, data: InsertQuery): Promise<void> {
    this.ensureConnection();

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

  async createTable(
    tableName: string,
    schema: Record<string, string>
  ): Promise<void> {
    this.ensureConnection();

    const fields = Object.entries(schema)
      .map(([columnName, columnType]) => `${columnName} ${columnType}`)
      .join(", ");

    const createTableSql = `CREATE TABLE IF NOT EXISTS ${tableName} (${fields});`;

    await this._client.query(createTableSql);
  }

  get client(): mysql.Connection {
    this.ensureConnection();
    return this._client;
  }

  private ensureConnection(): void {
    if (!this._client) {
      throw new Error("Not connected to a database");
    }
  }
}
