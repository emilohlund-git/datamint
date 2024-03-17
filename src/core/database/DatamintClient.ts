import {
  DatabasePlugin,
  MongoDBPlugin,
  MySQLPlugin,
  PostgreSQLPlugin,
} from "../plugins";
import type {
  AggregateQuery,
  CountQuery,
  DeleteQuery,
  FindQuery,
  InsertQuery,
  UpdateQuery,
} from "../plugins/types";
import { LoggerService } from "../logging/LoggerService";
import { Spinners } from "../constants";
import { DatabaseType, Emoji, LogColor, LogStyle } from "../enums";
import { DatabaseOptions } from "../interfaces";

export class DatamintClient<T extends DatabasePlugin> {
  private _plugin: T;
  private options?: DatabaseOptions;
  private database: DatabaseType;

  constructor(database: DatabaseType, options?: DatabaseOptions) {
    this._plugin = this.createPlugin(database);
    this.options = options;
    this.database = database;
  }

  async connect(connectionString?: string) {
    const connection = connectionString || this.getConnectionString();
    await this._plugin.connect(connection);
  }

  async disconnect() {
    await this._plugin.disconnect();
  }

  async reset() {
    if (!this.options) return;
    await this._plugin.reset(this.options.name);
  }

  async find(collection: string, query: FindQuery) {
    return await this._plugin.find(collection, query);
  }

  async delete(collection: string, query: DeleteQuery) {
    return await this._plugin.delete(collection, query);
  }

  async update(collection: string, query: UpdateQuery) {
    return await this._plugin.update(collection, query);
  }

  async insert(collection: string, query: InsertQuery) {
    return await this._plugin.insert(collection, query);
  }

  async count(collection: string, query: CountQuery) {
    return await this._plugin.count(collection, query);
  }

  async aggregate(collection: string, query: AggregateQuery) {
    return await this._plugin.aggregate(collection, query);
  }

  async listTables() {
    return await this._plugin.listTables();
  }

  async createTable(tableName: string, schema?: object): Promise<any> {
    if (schema && Object.keys(schema).length === 0) {
      throw new Error("Schema object should not be empty");
    }
    return await this._plugin.createTable(tableName, schema);
  }

  private getConnectionString() {
    if (!this.options) {
      throw new Error(`⚠️ Database options are not provided.`);
    }

    const connectionStrings: Record<DatabaseType, string> = {
      [DatabaseType.POSTGRESQL]: `postgres://${this.options.user}:${this.options.password}@localhost:${this.options.port}/${this.options.name}`,
      [DatabaseType.MYSQL]: `mysql://${this.options.user}:${this.options.password}@localhost:${this.options.port}/${this.options.name}`,
      [DatabaseType.MONGODB]: `mongodb://${this.options.user}:${this.options.password}@localhost:${this.options.port}/${this.options.name}`,
    };

    const connectionString = connectionStrings[this.database];

    if (!connectionString) {
      throw new Error(`⚠️ Unsupported database type: ${this.database}`);
    }

    return connectionString;
  }

  private createPlugin(databaseType: DatabaseType): T {
    const pluginMap: Record<DatabaseType, new () => DatabasePlugin> = {
      [DatabaseType.MONGODB]: MongoDBPlugin,
      [DatabaseType.MYSQL]: MySQLPlugin,
      [DatabaseType.POSTGRESQL]: PostgreSQLPlugin,
    };

    const PluginConstructor = pluginMap[databaseType];

    if (!PluginConstructor) {
      throw new Error(`⚠️ Unsupported database type: ${this.database}`);
    }

    return new PluginConstructor() as T;
  }

  checkDatabaseConnection = async (maxAttempts = 20, interval = 3000) => {
    if (!this.options) return;

    const connectionString = this.getConnectionString();

    let attempts = 0;

    const stopSpinner = LoggerService.spinner(
      `Connecting to the ${this.database} database...`,
      LogStyle.BRIGHT,
      LogColor.GRAY,
      Spinners.INITIALIZING,
      300
    );

    while (attempts < maxAttempts) {
      try {
        await this._plugin.connect(connectionString);

        stopSpinner();
        LoggerService.success(
          `Successfully connected to the ${this.database} database.`,
          Emoji.CHECK
        );

        return await this._plugin.disconnect();
      } catch (err: any) {
        attempts++;
        LoggerService.warning(
          `Failed to connect to the database. Retrying... (${attempts}/${maxAttempts})`,
          Emoji.FAIL_CONNECT,
          LogColor.YELLOW,
          LogStyle.DIM
        );
        LoggerService.warning(
          `${err.message.split(": ")[1]}`,
          Emoji.ELASTICSEARCH,
          LogColor.GRAY,
          LogStyle.DIM
        );
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    }

    throw new Error(
      `⚠️ Failed to connect to the database within the time limit.`
    );
  };
}
