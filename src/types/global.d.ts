import { Client } from "pg";
import { Datamint } from "../utils/Datamint";
import { Connection } from "mysql2/promise";
import { Db, MongoClient } from "mongodb";

declare global {
  namespace globalThis {
    var __POSTGRESQL_DATAMINT__: Datamint<Client, null> | undefined;
    var __MYSQL_DATAMINT__: Datamint<Connection, null> | undefined;
    var __MONGODB_DATAMINT__: Datamint<MongoClient, Db> | undefined;
  }
}
