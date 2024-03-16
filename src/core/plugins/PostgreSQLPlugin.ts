import pgPromise, { IDatabase } from "pg-promise";
import {
  CountQuery,
  DeleteQuery,
  FindQuery,
  InsertQuery,
  UpdateQuery,
} from "./types";
import { BasePlugin } from "../plugins/BasePlugin";

export class PostgreSQLPlugin extends BasePlugin<IDatabase<any>> {
  private _pgp: pgPromise.IMain;

  async connect(connectionString: string): Promise<void> {
    if (!this._client) {
      this._pgp = pgPromise();
      this._client = this._pgp(connectionString);

      try {
        await this._client.connect();
      } catch (error: any) {
        throw new Error(`Failed to connect to the database: ${error.message}`);
      }
    }
  }

  async reset(database: string): Promise<void> {
    await this.client.none("DROP SCHEMA public CASCADE");
    await this.client.none("CREATE SCHEMA public");
  }

  async disconnect(): Promise<void> {}

  async find(tableName: string, conditions: FindQuery): Promise<any[]> {
    const whereClauses = Object.entries(conditions)
      .map(([field, value], index) => {
        if (Array.isArray(value)) {
          const placeholders = value
            .map((_, i) => `$${index + i + 1}`)
            .join(", ");
          return `${field} IN (${placeholders})`;
        } else {
          return `${field} = $${index + 1}`;
        }
      })
      .join(" AND ");

    const values = Object.values(conditions).flat();
    const query = `SELECT * FROM ${tableName} WHERE ${whereClauses};`;

    return this.client.manyOrNone(query, values);
  }

  async update(tableName: string, query: UpdateQuery): Promise<any> {
    const sql = `UPDATE ${tableName} SET ${this.objectToSql(
      query.update
    )} WHERE ${this.objectToSql(query.filter)}`;
    const [result] = await this.client?.query(sql);
    return result;
  }

  async delete(tableName: string, query: DeleteQuery): Promise<any> {
    const sql = `DELETE FROM ${tableName} WHERE ${this.objectToSql(query)}`;
    const [result] = await this.client?.query(sql);
    return result;
  }

  protected escapeValue(value: any): string {
    return this._pgp.as.value(value);
  }

  async insert(tableName: string, data: InsertQuery): Promise<void> {
    for (const row of data) {
      const fields = Object.keys(row).join(", ");
      const placeholders = Object.keys(row)
        .map((_, index) => `$${index + 1}`)
        .join(", "); // Creates placeholders like $1, $2
      const values = Object.values(row);
      const query = `INSERT INTO ${tableName} (${fields}) VALUES (${placeholders});`;
      await this.client.none(query, values); // Pass values as the second parameter for parameterized query
    }
  }

  async count(tableName: string, query: CountQuery): Promise<number> {
    const whereClause = this.objectToSql(query);
    const sql = `SELECT COUNT(*) FROM ${tableName} WHERE ${whereClause}`;
    const [{ count }] = await this.client?.query(sql);
    return +count;
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

  async listTables(): Promise<{ name: string }[]> {
    const query = `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`;
    const tables = await this.client.manyOrNone(query);

    return tables.map((table) => table.table_name);
  }
}
