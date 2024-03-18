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
  const environment = new TestEnvironment<DatabasePluginMap[K]>(
    database,
    config
  );
  const client = new DatamintClient<DatabasePluginMap[K]>(database, config);

  return {
    client,
    setup: async () => {
      await environment.setup();
      await client.connect();
    },
    teardown: async () => {
      await client.disconnect();
      await environment.teardown();
    },
  };
}
