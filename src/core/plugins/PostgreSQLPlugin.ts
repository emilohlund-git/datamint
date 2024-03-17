import pgPromise, { IDatabase } from "pg-promise";
import {
  AggregateQuery,
  Condition,
  CountQuery,
  DeleteQuery,
  FindQuery,
  InsertQuery,
  UpdateQuery,
} from "./types";
import { BasePlugin } from "../plugins/BasePlugin";
import { ensureDatabaseException } from "src/core/utils";

export class PostgreSQLPlugin extends BasePlugin<IDatabase<any>> {
  private _pgp: pgPromise.IMain;

  async connect(connectionString: string): Promise<void> {
    this._pgp = pgPromise();
    this._client = this._pgp(connectionString);
    try {
      await this._client.connect();
    } catch (err: unknown) {
      const error = ensureDatabaseException(err);
      throw new Error(`Failed to connect to the database: ${error.message}`);
    }
  }

  async reset(database: string): Promise<void> {
    await this.client.none("DROP SCHEMA public CASCADE");
    await this.client.none("CREATE SCHEMA public");
  }

  async disconnect(): Promise<void> {
    this._pgp.end();
  }

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
    const [result] = await this.client.query(sql);
    return result;
  }

  async delete(tableName: string, query: DeleteQuery): Promise<any> {
    const sql = `DELETE FROM ${tableName} WHERE ${this.objectToSql(query)}`;
    const [result] = await this.client.query(sql);
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
    const [{ count }] = await this.client.query(sql);
    return +count;
  }

  async aggregate(tableName: string, query: AggregateQuery): Promise<any> {
    const sql = this.translateAggregateQuery(tableName, query);
    const [rows] = await this.client.query(sql);
    return rows;
  }

  async createTable(
    tableName: string,
    schema: Record<string, string>
  ): Promise<void> {
    const fields = Object.entries(schema)
      .map(([columnName, columnType]) => `${columnName} ${columnType}`)
      .join(", ");

    const createTableSql = `CREATE TABLE IF NOT EXISTS ${tableName} (${fields});`;

    try {
      await this.client.none(createTableSql);
    } catch (err: unknown) {
      const error = ensureDatabaseException(err);
      throw new Error(`Failed to create table: ${error.message}`);
    }
  }

  async listTables(): Promise<{ name: string }[]> {
    const query = `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`;
    const tables = await this.client.manyOrNone(query);

    return tables.map((table) => table.table_name);
  }

  protected translateAggregateQuery(
    tableName: string,
    query: AggregateQuery
  ): string {
    let selectFields: string[] = [];
    let groupByFields: string[] = [];
    let whereClause = "";
    let sort = "";

    for (const stage of query) {
      if ("$match" in stage) {
        const conditions = this.translateMatchStage(stage["$match"]);
        whereClause = " WHERE " + conditions;
      } else if ("$group" in stage) {
        Object.entries(stage["$group"]).forEach(([field, value]) => {
          if (typeof value === "object" && "$count" in value) {
            selectFields.push(
              `COUNT("${value.$count.toLowerCase()}") AS count`
            );
          } else {
            selectFields.push(`"${field.toLowerCase()}"`);
            groupByFields.push(`"${field.toLowerCase()}"`);
          }
        });
      } else if ("$sort" in stage) {
        sort = this.translateSortStage(stage["$sort"]);
      }
    }

    if (selectFields.length === 0) {
      selectFields.push("*");
    }

    let sqlQuery = `SELECT ${selectFields.join(", ")} FROM "${tableName}"`;

    if (whereClause) {
      sqlQuery += whereClause;
    }

    if (groupByFields.length > 0) {
      sqlQuery += " GROUP BY " + groupByFields.join(", ");
    }

    if (sort) {
      sqlQuery += " ORDER BY " + sort;
    }

    return sqlQuery;
  }

  protected translateSortStage(sort: { [key: string]: 1 | -1 }): string {
    return Object.entries(sort)
      .map(
        ([field, direction]) => `"${field}" ${direction === 1 ? "ASC" : "DESC"}`
      )
      .join(", ");
  }

  protected translateMatchStage(match: {
    [key: string]: string | number | Condition;
  }): string {
    const conditions = Object.entries(match).map(([key, value]) => {
      if (typeof value === "object") {
        return this.translateComplexCondition(key, value);
      } else {
        return `"${key}" = '${value}'`;
      }
    });

    return conditions.join(" AND ");
  }

  protected translateComplexCondition(
    field: string,
    condition: Condition
  ): string {
    const operatorMap = {
      $gt: ">",
      $lt: "<",
      $gte: ">=",
      $lte: "<=",
      $eq: "=",
    };

    const conditions = Object.entries(condition).map(([operator, value]) => {
      if (operator in operatorMap) {
        return `"${field}" ${operatorMap[operator as keyof object]} '${value}'`;
      } else {
        throw new Error(`Unsupported operator: ${operator}`);
      }
    });

    return conditions.join(" AND ");
  }
}
