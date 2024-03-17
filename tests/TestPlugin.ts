import { BasePlugin } from "@datamint/core/plugins";
import {
  AggregateQuery,
  Condition,
  InsertQuery,
  UpdateQuery,
} from "@datamint/core/plugins/types";

export class TestPlugin extends BasePlugin<TestPlugin> {
  connect(connectionString: string): Promise<void> {
    return new Promise((resolve) => resolve());
  }

  reset(database: string): Promise<void> {
    return new Promise((resolve) => resolve());
  }

  disconnect(): Promise<void> {
    return new Promise((resolve) => resolve());
  }

  find(collectionName: string, query: object): Promise<any[]> {
    return Promise.resolve(query as any[]);
  }

  update(collectionName: string, query: UpdateQuery): Promise<any> {
    return Promise.resolve(query);
  }

  delete(collectionName: string, query: object): Promise<any> {
    return Promise.resolve(query);
  }

  insert(collectionName: string, data: InsertQuery): Promise<any> {
    return Promise.resolve(data);
  }

  createTable(
    collectionName: string,
    schema?: object | undefined
  ): Promise<void> {
    return new Promise((resolve) => resolve());
  }

  listTables(): Promise<{ name: string }[]> {
    return Promise.resolve(null as any);
  }

  count(collectionName: string, query: object): Promise<number> {
    return Promise.resolve(1);
  }

  aggregate(collectionName: string, query: AggregateQuery): Promise<any> {
    return Promise.resolve(query);
  }

  protected escapeValue(value: any): string {
    return JSON.stringify(value);
  }

  public translateComplexConditionExposed(
    field: string,
    condition: Condition
  ): string {
    return this.translateComplexCondition(field, condition);
  }

  public translateMatchStageExposed(match: {
    [key: string]: string | number | Condition;
  }): string {
    return this.translateMatchStage(match);
  }

  public translateAggregateQueryExposed(
    tableName: string,
    query: AggregateQuery
  ): string {
    return this.translateAggregateQuery(tableName, query);
  }
}
