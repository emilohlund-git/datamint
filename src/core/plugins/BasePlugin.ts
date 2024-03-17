import {
  AggregateQuery,
  Condition,
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
  abstract listTables(): Promise<{ name: string }[]>;
  abstract count(collectionName: string, query: object): Promise<number>;
  abstract aggregate(
    collectionName: string,
    query: AggregateQuery
  ): Promise<any>;

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
            selectFields.push(`COUNT(\`${value.$count}\`) AS count`);
          } else {
            selectFields.push(`\`${field}\``);
            groupByFields.push(`\`${field}\``);
          }
        });
      } else if ("$sort" in stage) {
        sort = this.translateSortStage(stage["$sort"]);
      }
    }

    if (selectFields.length === 0) {
      selectFields.push("*");
    }

    let sqlQuery = `SELECT ${selectFields.join(", ")} FROM \`${tableName}\``;

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
        ([field, direction]) =>
          `\`${field}\` ${direction === 1 ? "ASC" : "DESC"}`
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
        return `\`${key}\` = '${value}'`;
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
        return `\`${field}\` ${
          operatorMap[operator as keyof object]
        } '${value}'`;
      } else {
        throw new Error(`Unsupported operator: ${operator}`);
      }
    });

    return conditions.join(" AND ");
  }
}
