import { Datamint } from "../utils/Datamint";

declare global {
  namespace globalThis {
    var __POSTGRESQL_DATAMINT__: Datamint | undefined;
    var __MYSQL_DATAMINT__: Datamint | undefined;
    var __MONGODB_DATAMINT__: Datamint | undefined;
  }
}
