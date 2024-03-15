import {
  DatabasePlugin,
  MongoDBPlugin,
  MySQLPlugin,
  PostgreSQLPlugin,
} from "../plugins";
import type {
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
  private options: DatabaseOptions;
  private database: DatabaseType;

  constructor(database: DatabaseType, options: DatabaseOptions) {
    this._plugin = this.createPlugin(database);
    this.options = options;
    this.database = database;
  }

  async connect() {
    await this._plugin.connect(this.getConnectionString());
  }

  async disconnect() {
    await this._plugin.disconnect();
  }

  async reset() {
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

  async createTable(tableName: string, schema?: object): Promise<any> {
    return await this._plugin.createTable(tableName, schema);
  }

  private getConnectionString() {
    const connectionStrings: Record<DatabaseType, string> = {
      [DatabaseType.POSTGRESQL]: `postgres://${this.options.user}:${this.options.password}@localhost:5432/${this.options.name}`,
      [DatabaseType.MYSQL]: `mysql://${this.options.user}:${this.options.password}@localhost:3306/${this.options.name}`,
      [DatabaseType.MONGODB]: `mongodb://${this.options.user}:${this.options.password}@localhost:27017/${this.options.name}`,
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
        LoggerService.info(
          ` Successfully connected to the ${this.database} database.`,
          LogColor.GREEN,
          LogStyle.BRIGHT,
          Emoji.CHECK
        );

        return await this._plugin.disconnect();
      } catch (err: any) {
        attempts++;
        LoggerService.warning(
          `Failed to connect to the database. Retrying... (${attempts}/${maxAttempts})`,
          LogColor.YELLOW,
          LogStyle.DIM
        );
        LoggerService.warning(
          `Reason: ${err.message}`,
          LogColor.GRAY,
          LogStyle.DIM,
          Emoji.ELASTICSEARCH
        );
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    }

    throw new Error(
      `⚠️ Failed to connect to the database within the time limit.`
    );
  };
}
