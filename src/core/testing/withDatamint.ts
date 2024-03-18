import { LoggerService, Verbosity } from "../logging";
import { Datamint } from "../Datamint";
import { DatamintClient } from "../database";
import { DatabaseType } from "../enums";
import { DatabaseOptions } from "../interfaces";
import {
  DatabasePlugin,
  MongoDBPlugin,
  MySQLPlugin,
  PostgreSQLPlugin,
} from "../plugins";

interface DatabasePluginMap {
  [DatabaseType.MONGODB]: MongoDBPlugin;
  [DatabaseType.MYSQL]: MySQLPlugin;
  [DatabaseType.POSTGRESQL]: PostgreSQLPlugin;
}

class TestEnvironment<T extends DatabasePlugin> {
  private _mint: Datamint<T>;

  constructor(database: DatabaseType, config: DatabaseOptions) {
    this._mint = new Datamint(database, config);
  }

  async setup() {
    await this._mint.start();
  }

  async teardown() {
    await this._mint.stop();
  }
}

export function withDatamint<K extends DatabaseType>(
  database: K,
  config: DatabaseOptions
) {
  LoggerService.verbosity = Verbosity.DEBUG;
  const environment = new TestEnvironment<DatabasePluginMap[K]>(
    database,
    config
  );
  const client = new DatamintClient<DatabasePluginMap[K]>(database, config);

  return {
    client,
    setup: async () => {
      LoggerService.debug("Setting up the test environment");
      await environment.setup();
      LoggerService.debug("Connecting to the database");
      await client.connect();
      LoggerService.debug("Connected to the database");
    },
    teardown: async () => {
      LoggerService.debug("Tearing down the test environment");
      await client.disconnect();
      LoggerService.debug("Disconnected from the database");
      await environment.teardown();
      LoggerService.debug("Test environment has been torn down");
    },
  };
}
