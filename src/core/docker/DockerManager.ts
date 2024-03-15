import { COMPOSE_FILE, DOCKER_DIR, INIT_MONGO_FILE } from "../constants";
import { DockerService } from "./DockerService";
import { DatabaseType, Emoji, LogColor, LogStyle } from "../enums";
import { DatabaseOptions } from "../interfaces";
import path from "path";
import { LoggerService } from "../logging/LoggerService";
import { DatabasePlugin } from "../plugins";
import { DatamintClient } from "../database/DatamintClient";
import { FileProcessor } from "../FileProcessor";
import { Observer } from "../Observer";

export class DockerManager<T extends DatabasePlugin> extends Observer<
  DockerManager<any>
> {
  private service: DockerService;
  public tempDir: string;
  private options: DatabaseOptions;
  private dockerContainerPath: string;
  public isContainerRunning: boolean = false;
  private fileProcessor: FileProcessor;
  private client: DatamintClient<T>;
  private errorMessages: { [key: number]: string } = {
    0: `Container stopped - no tasks left to perform.`,
    1: `Docker daemon not running. Please start it.`,
    137: `Container terminated - manual stop or out of memory.`,
    139: `Container error - possible bug in the application.`,
    143: `Container stopped - it received a termination signal.`,
  };

  constructor(
    database: DatabaseType,
    options: DatabaseOptions,
    fileProcessor: FileProcessor
  ) {
    super(database);

    this.service = new DockerService();
    this.options = options;
    this.setEnvironmentVariables();
    this.client = new DatamintClient(database, options);
    this.fileProcessor = fileProcessor;

    process.on("SIGINT", () =>
      this.gracefulShutdown({
        database: this.database,
        tempDir: this.tempDir,
      })
    );
    process.on("SIGTERM", () =>
      this.gracefulShutdown({
        database: this.database,
        tempDir: this.tempDir,
      })
    );
    process.on("uncaughtException", () =>
      this.gracefulShutdown({
        database: this.database,
        tempDir: this.tempDir,
      })
    );

    this.addObserver(this.fileProcessor);
  }

  async update(info: { database: DatabaseType; tempDir: string }) {}

  async startContainer() {
    this.tempDir = await this.fileProcessor.createTempDir();

    const composeFilePath = this.fileProcessor.getFilePath(
      DOCKER_DIR,
      `${COMPOSE_FILE}.${this.database.toLowerCase()}.yml`
    );

    const initMongoFilePath = this.fileProcessor.getFilePath(
      DOCKER_DIR,
      INIT_MONGO_FILE
    );

    const tempInitMongoFilePath = path.join(this.tempDir, INIT_MONGO_FILE);
    const tempComposeFilePath = path.join(
      this.tempDir,
      `docker-compose.${this.database.toLowerCase()}.yml`
    );

    if (this.database === DatabaseType.MONGODB) {
      await this.fileProcessor.processFile(
        initMongoFilePath,
        tempInitMongoFilePath,
        this.options
      );
    }

    await this.fileProcessor.processFile(
      composeFilePath,
      tempComposeFilePath,
      this.options
    );

    this.dockerContainerPath = tempComposeFilePath;

    LoggerService.info(
      `Starting ${this.database} Docker container...`,
      LogColor.CYAN,
      LogStyle.BRIGHT,
      Emoji[this.database.toUpperCase() as keyof typeof Emoji]
    );

    try {
      await this.service.pullImage(tempComposeFilePath, this.database);
      await this.service.startContainer(tempComposeFilePath, this.database);
      this.isContainerRunning = true;
      await this.client.checkDatabaseConnection();
    } catch (error: any) {
      this.handleError(error, `Failed to start the ${this.database} container`);
    }
  }

  async stopContainer() {
    if (!this.isContainerRunning) {
      return null;
    }

    LoggerService.info(
      `Stopping ${this.database} Docker container...`,
      LogColor.CYAN,
      LogStyle.BRIGHT,
      Emoji[this.database.toUpperCase() as keyof typeof Emoji]
    );

    try {
      await this.fileProcessor.cleanupTempDir(this.tempDir);
      await this.service.stopContainer(this.dockerContainerPath);
      this.isContainerRunning = false;
      LoggerService.info(
        ` Successfully stopped the ${this.database} container.`,
        LogColor.GREEN,
        LogStyle.DIM,
        Emoji.CHECK
      );
    } catch (error: any) {
      await this.gracefulShutdown({
        database: this.database,
        tempDir: this.tempDir,
      });
    }

    return null;
  }

  private setEnvironmentVariables() {
    process.env.DB_USER = this.options.user;
    process.env.DB_PASSWORD = this.options.password;
    process.env.DB_NAME = this.options.name;
  }

  private async handleError(error: any, errorMessage: string) {
    const additionalMessage = this.errorMessages[error.code] || "";
    console.log(error.code, error.message);
    const formattedMessage = this.formatErrorMessage(
      errorMessage,
      additionalMessage
    );
    LoggerService.error(formattedMessage);

    if (this.isContainerRunning) {
      await this.gracefulShutdown({
        database: this.database,
        tempDir: this.tempDir,
      });
    }

    throw error;
  }

  private formatErrorMessage(
    baseMessage: string,
    additionalMessage: string
  ): string {
    return `${baseMessage}: \n${LogStyle.RESET}${LogColor.WHITE}${additionalMessage}${LogStyle.RESET}`;
  }

  protected async gracefulShutdown(info: {
    database: DatabaseType;
    tempDir: string;
  }): Promise<void> {
    try {
      if (this.isContainerRunning) {
        LoggerService.info(
          `Gracefully shutting down the ${info.database} container...`,
          LogColor.YELLOW,
          LogStyle.BRIGHT,
          Emoji[info.database.toUpperCase() as keyof typeof Emoji]
        );

        await this.stopContainer();
      }

      this.notifyObservers({
        database: info.database,
        tempDir: this.tempDir,
      });
    } catch (error: any) {
      LoggerService.error(" Failed to clean up the Docker container.", error);
    }
  }
}
