import pgPromise, { IDatabase } from "pg-promise";
import { DatabasePlugin } from "./DatabasePlugin";
import { DeleteQuery, FindQuery, InsertQuery, UpdateQuery } from "./types";

export class PostgreSQLPlugin implements DatabasePlugin {
  private _client: IDatabase<any>;
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
    this.ensureConnection();

    await this._client.none("DROP SCHEMA public CASCADE");
    await this._client.none("CREATE SCHEMA public");
  }

  async disconnect(): Promise<void> {}

  async find(tableName: string, conditions: FindQuery): Promise<any[]> {
    this.ensureConnection();

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

    return this._client.manyOrNone(query, values);
  }

  async update(tableName: string, query: UpdateQuery): Promise<any> {
    this.ensureConnection();

    const sql = `UPDATE ${tableName} SET ${this.objectToSql(
      query.update
    )} WHERE ${this.objectToSql(query.filter)}`;
    const [result] = await this._client?.query(sql);
    return result;
  }

  async delete(tableName: string, query: DeleteQuery): Promise<any> {
    this.ensureConnection();

    const sql = `DELETE FROM ${tableName} WHERE ${this.objectToSql(query)}`;
    const [result] = await this._client?.query(sql);
    return result;
  }

  private objectToSql(query: object): string {
    return Object.entries(query)
      .map(([key, value]) => `${key} = ${this._pgp.as.value(value)}`)
      .join(" AND ");
  }

  async insert(tableName: string, data: InsertQuery): Promise<void> {
    this.ensureConnection();

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

  get client(): IDatabase<any> {
    this.ensureConnection();

    return this._client;
  }

  private ensureConnection(): void {
    if (!this._client) {
      throw new Error("Not connected to a database");
    }
  }
}
