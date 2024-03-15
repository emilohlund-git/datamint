import { DatabaseOperation } from "../enums/DatabaseOperation";

export type FindQuery = object;
export type InsertQuery = object[];
export type UpdateQuery = { filter: object; update: object };
export type DeleteQuery = object;
export type CountQuery = object;
export type AggregateQuery = object[];

export type OperationMap = {
  [DatabaseOperation.FIND]: FindQuery;
  [DatabaseOperation.INSERT]: InsertQuery;
  [DatabaseOperation.UPDATE]: UpdateQuery;
  [DatabaseOperation.DELETE]: DeleteQuery;
  [DatabaseOperation.COUNT]: CountQuery;
  [DatabaseOperation.AGGREGATE]: AggregateQuery;
};
