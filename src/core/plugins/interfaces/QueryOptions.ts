import { DatabaseOperation } from "../enums/DatabaseOperation";

export interface QueryOptions<T> {
  operation: DatabaseOperation;
  query: T;
  params?: object;
}
