import path from "path";
import { DatabasePlugin } from "../plugins/DatabasePlugin";
import { LoggerService } from "./LoggerService";
import { waitForDatabaseConnection } from "./helpers/waitForDatabaseConnection";
import { DockerService } from "./DockerService";
import { DatabaseOptions } from "./interfaces/DatabaseOptions";
import { LogStyle, LogColor, Emoji, DatabaseType } from "./enums";
import { DOCKER_DIR, INIT_MONGO_FILE, COMPOSE_FILE } from "./constants";
import { DatamintManager } from "./DatamintManager";

export class Datamint<T extends DatabasePlugin> {
  private hasStartedProcessing = false;
  private dockerContainerPath: string;
  private tempDir: string;
  private _plugin: T;
  private database: DatabaseType;
  private options: DatabaseOptions;

  constructor(
    plugin: T,
    database: DatabaseType,
    options: DatabaseOptions
  ) {
    this._plugin = plugin;
    this.database = database;
    this.options = options;
    this.setEnvironmentVariables();

    process.on("SIGINT", () => this.gracefulShutdown());
    process.on("SIGTERM", () => this.gracefulShutdown());
    process.on("uncaughtException", () => {
      this.gracefulShutdown();
    });
  }

  async startDockerContainer() {
    this.hasStartedProcessing = true;
    DatamintManager.addInstance(this);

    const connectionString = this.getConnectionString();
    const composeFilePath = this.getFilePath(
      DOCKER_DIR,
      `${COMPOSE_FILE}.${this.database.toLowerCase()}.yml`
    );
    const initMongoFilePath = this.getFilePath(DOCKER_DIR, INIT_MONGO_FILE);

    this.tempDir = await DockerService.createTempDir();

    const tempInitMongoFilePath = path.join(this.tempDir, INIT_MONGO_FILE);
    const tempComposeFilePath = path.join(
      this.tempDir,
      `docker-compose.${this.database.toLowerCase()}.yml`
    );

    await this.processFile(initMongoFilePath, tempInitMongoFilePath);
    await this.processFile(composeFilePath, tempComposeFilePath);

    this.dockerContainerPath = tempComposeFilePath;

    LoggerService.info(
      `Starting ${this.database} Docker container...`,
      LogColor.CYAN,
      LogStyle.BRIGHT,
      Emoji[this.database.toUpperCase() as keyof typeof Emoji]
    );

    try {
      await DockerService.pullImage(tempComposeFilePath, this.database);
      await DockerService.startContainer(tempComposeFilePath, this.database);

      await waitForDatabaseConnection(
        connectionString,
        this._plugin,
        this.database
      );
    } catch (error: any) {
      this.handleError(
        error,
        `Failed to start the ${this.database} container.`
      );
    }
  }

  async connectPlugin() {
    await this._plugin.connect(this.getConnectionString());
  }

  async disconnectPlugin() {
    await this._plugin.disconnect();
  }

  async resetPlugin() {
    await this._plugin.reset(this.options.name);
  }

  async stopDockerContainer() {
    LoggerService.info(
      `Stopping ${this.database} Docker container...`,
      LogColor.CYAN,
      LogStyle.BRIGHT,
      Emoji[this.database.toUpperCase() as keyof typeof Emoji]
    );

    try {
      await DockerService.stopContainer(this.dockerContainerPath);
      LoggerService.info(
        ` Successfully stopped the ${this.database} container.`,
        LogColor.GREEN,
        LogStyle.DIM,
        Emoji.CHECK
      );
      await DockerService.cleanupTempDir(this.tempDir);
      LoggerService.info(
        `Successfully cleaned the ${this.database} temp files.`,
        LogColor.GREEN,
        LogStyle.DIM,
        Emoji.CLEANUP
      );
    } catch (error: any) {
      this.handleError(error, `Failed to stop the ${this.database} container.`);
    }

    return null;
  }

  private setEnvironmentVariables() {
    process.env.DB_USER = this.options.user;
    process.env.DB_PASSWORD = this.options.password;
    process.env.DB_NAME = this.options.name;
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

  private async handleError(error: any, errorMessage: string) {
    LoggerService.error(errorMessage);
    LoggerService.info(
      `Reason: ${error.message}`,
      LogColor.GRAY,
      LogStyle.DIM,
      Emoji.ELASTICSEARCH
    );

    try {
      await this.stopDockerContainer();
    } catch (error: any) {
      LoggerService.error(" Failed to clean up the Docker container.", error);
    }

    throw error;
  }

  private getFilePath(...paths: string[]) {
    return path.join(__dirname, "..", ...paths);
  }

  private async processFile(sourcePath: string, destinationPath: string) {
    await DockerService.copyFile(sourcePath, destinationPath);

    let fileContent = await DockerService.readFile(sourcePath);
    fileContent = await DockerService.parseComposeFile(
      fileContent,
      this.options
    );

    await DockerService.writeFile(destinationPath, fileContent);
  }

  get plugin() {
    return this._plugin;
  }

  private async gracefulShutdown() {
    if (this.hasStartedProcessing === false) {
      return;
    }

    LoggerService.info(
      `Gracefully shutting down the ${this.database} container...`,
      LogColor.CYAN,
      LogStyle.BRIGHT,
      Emoji[this.database.toUpperCase() as keyof typeof Emoji]
    );
    await this.stopDockerContainer().catch((err) => {
      LoggerService.error("Failed to gracefully shut down the container.", err);
    });

    const index = DatamintManager.getInstanceIndex(this);
    if (index > -1) {
      DatamintManager.removeInstance(this);
    }

    if (DatamintManager.getInstances().length === 0) {
      process.exit(0);
    }
  }
}
