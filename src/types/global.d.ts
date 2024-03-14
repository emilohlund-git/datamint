import { Client } from "pg";
import { Datamint } from "../utils/Datamint";
import { Connection } from "mysql2/promise";
import { MongoClient } from "mongodb";

declare global {
  namespace globalThis {
    var __POSTGRESQL_DATAMINT__: Datamint<Client> | undefined;
    var __MYSQL_DATAMINT__: Datamint<Connection> | undefined;
    var __MONGODB_DATAMINT__: Datamint<MongoClient> | undefined;
  }
}
