import { MongoDBPlugin, MySQLPlugin, PostgreSQLPlugin } from "../core/plugins";
import { Datamint } from "../core/Datamint";

declare global {
  namespace globalThis {
    var __POSTGRESQL_DATAMINT__: Datamint<PostgreSQLPlugin> | undefined;
    var __MYSQL_DATAMINT__: Datamint<MySQLPlugin> | undefined;
    var __MONGODB_DATAMINT__: Datamint<MongoDBPlugin> | undefined;
  }
}
