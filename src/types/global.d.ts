import { MongoDBPlugin, MySQLPlugin, PostgreSQLPlugin } from "../plugins";
import { Datamint } from "../utils/Datamint";

declare global {
  namespace globalThis {
    var __POSTGRESQL_DATAMINT__: Datamint<PostgreSQLPlugin> | undefined;
    var __MYSQL_DATAMINT__: Datamint<MySQLPlugin> | undefined;
    var __MONGODB_DATAMINT__: Datamint<MongoDBPlugin> | undefined;
  }
}
