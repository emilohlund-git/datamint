import { DatabaseOperation } from "../enums/DatabaseOperation";

export type FindQuery = object;
export type InsertQuery = object[];
export type UpdateQuery = { filter: object; update: object };
export type DeleteQuery = object;
export type CountQuery = object;

export enum SortOrder {
  ASC = 1,
  DESC = -1,
}

export type Condition = {
  $eq?: string;
  $gt?: number;
  $lt?: number;
  $gte?: number;
  $lte?: number;
};

export type MatchStage = {
  $match: {
    [key: string]: string | number | Condition;
  };
};

export type GroupStage = {
  $group: {
    [key: string]: string | { $count: string };
  };
};

export type SortStage = {
  $sort: {
    [key: string]: SortOrder;
  };
};

export type AggregateQuery = (MatchStage | GroupStage | SortStage)[];

export type OperationMap = {
  [DatabaseOperation.FIND]: FindQuery;
  [DatabaseOperation.INSERT]: InsertQuery;
  [DatabaseOperation.UPDATE]: UpdateQuery;
  [DatabaseOperation.DELETE]: DeleteQuery;
  [DatabaseOperation.COUNT]: CountQuery;
  [DatabaseOperation.AGGREGATE]: AggregateQuery;
};
