import mysql from "mysql2/promise";
import { DeleteQuery, FindQuery, InsertQuery, UpdateQuery } from "./types";
import { BasePlugin } from "../plugins/BasePlugin";

export class MySQLPlugin extends BasePlugin<mysql.Connection> {
  async connect(connectionString: string): Promise<void> {
    try {
      this._client = await mysql.createConnection(connectionString);
      await this._client.connect();
    } catch (error) {
      throw error;
    }
  }

  async reset(database: string): Promise<void> {
    await this.client.query(`DROP DATABASE IF EXISTS ${database}`);
    await this.client.query(`CREATE DATABASE ${database}`);
  }

  async disconnect(): Promise<void> {
    await this.client.end();
  }

  async find(tableName: string, query: FindQuery): Promise<any> {
    const sql = `SELECT * FROM ${tableName} WHERE ${this.objectToSql(query)}`;
    const [rows] = (await this.client?.query(sql)) as [
      mysql.RowDataPacket[],
      mysql.FieldPacket[]
    ];
    return rows;
  }

  async update(tableName: string, query: UpdateQuery): Promise<any> {
    const sql = `UPDATE ${tableName} SET ${this.objectToSql(
      query.update
    )} WHERE ${this.objectToSql(query.filter)}`;
    const [result] = (await this.client?.query(sql)) as [
      mysql.RowDataPacket[],
      mysql.FieldPacket[]
    ];
    return result;
  }

  async delete(tableName: string, query: DeleteQuery): Promise<any> {
    const sql = `DELETE FROM ${tableName} WHERE ${this.objectToSql(query)}`;
    const [result] = (await this.client?.query(sql)) as [
      mysql.RowDataPacket[],
      mysql.FieldPacket[]
    ];
    return result;
  }

  protected escapeValue(value: any): string {
    return mysql.escape(value);
  }

  async truncate(tableName: string) {
    await this.client.query(`TRUNCATE TABLE ${tableName}`);
  }

  async insert(tableName: string, data: InsertQuery): Promise<void> {
    for (const row of data) {
      const fields = Object.keys(row).join(", ");
      const placeholders = Object.keys(row)
        .map(() => "?")
        .join(", ");
      const values = Object.values(row);
      const query = `INSERT INTO ${tableName} (${fields}) VALUES (${placeholders});`;
      await this.client.query(query, values);
    }
  }

  async createTable(
    tableName: string,
    schema: Record<string, string>
  ): Promise<void> {
    const fields = Object.entries(schema)
      .map(([columnName, columnType]) => `${columnName} ${columnType}`)
      .join(", ");

    const createTableSql = `CREATE TABLE IF NOT EXISTS ${tableName} (${fields});`;

    await this.client.query(createTableSql);
  }
}
