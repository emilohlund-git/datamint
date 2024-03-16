import {
  COMPOSE_FILE,
  DOCKER_DIR,
  INIT_MONGO_FILE,
  Spinners,
} from "../constants";
import { DockerService } from "./DockerService";
import { DatabaseType, Emoji, LogColor, LogStyle } from "../enums";
import { DatabaseOptions } from "../interfaces";
import path from "path";
import { LoggerService } from "../logging/LoggerService";
import { DatabasePlugin } from "../plugins";
import { DatamintClient } from "../database/DatamintClient";
import { FileProcessor } from "../FileProcessor";
import { Observer } from "../Observer";
import { DockerErrorHandler } from "./DockerErrorHandler";
import { ensureDockerException } from "../utils";
import {
  MONGODB_DOCKER_EXTENSION,
  MYSQL_DOCKER_EXTENSION,
  POSTGRESQL_DOCKER_EXTENSION,
} from "../docker/constants";

export class DockerManager<T extends DatabasePlugin> extends Observer<
  DockerManager<T>
> {
  private service: DockerService;
  public tempDir: string;
  private options: DatabaseOptions;
  private dockerContainerPath: string;
  public hasRunningContainer: boolean = false;
  private containerName: string;
  private fileProcessor: FileProcessor;
  private client: DatamintClient<T>;
  private errorHandler: DockerErrorHandler<T>;

  constructor(
    database: DatabaseType,
    options: DatabaseOptions,
    fileProcessor: FileProcessor
  ) {
    super(database);

    this.options = options;
    this.errorHandler = new DockerErrorHandler(this, database);
    this.service = new DockerService();
    this.client = new DatamintClient(database, options);
    this.fileProcessor = fileProcessor;
    this.addObserver(this.fileProcessor);
  }

  async update() {}

  async startContainer() {
    this.tempDir = await this.fileProcessor.createTempDir();
    await this.prepareFiles();

    LoggerService.info(
      `Starting ${this.database} Docker container...`,
      Emoji[this.database.toUpperCase() as keyof typeof Emoji]
    );

    await this.handleContainerOperation(async () => {
      await this.service.pullImage(this.dockerContainerPath, this.database);
      await this.service.startContainer(
        this.dockerContainerPath,
        this.database
      );
      this.hasRunningContainer = true;

      await this.client.checkDatabaseConnection();
    }, "start");
  }

  async stopContainer() {
    if (!this.hasRunningContainer) {
      await this.fileProcessor.cleanupTempDir(this.tempDir);
      return null;
    }

    LoggerService.info(
      `Stopping ${this.database} Docker container...`,
      Emoji[this.database.toUpperCase() as keyof typeof Emoji]
    );

    await this.handleContainerOperation(async () => {
      await this.service.stopContainer(this.dockerContainerPath);
      await this.fileProcessor.cleanupTempDir(this.tempDir);
      this.hasRunningContainer = false;
    }, "stop");
  }

  private async prepareFiles() {
    const composeFilePath = this.fileProcessor.getFilePath(
      DOCKER_DIR,
      `${COMPOSE_FILE}.${this.database.toLowerCase()}.yml`
    );

    const tempComposeFilePath = path.join(
      this.tempDir,
      `docker-compose.${this.database.toLowerCase()}.yml`
    );

    this.containerName = this.getContainerName(tempComposeFilePath);

    if (this.database === DatabaseType.MONGODB) {
      const initMongoFilePath = this.fileProcessor.getFilePath(
        DOCKER_DIR,
        INIT_MONGO_FILE
      );

      const tempInitMongoFilePath = path.join(this.tempDir, INIT_MONGO_FILE);

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
  }

  private async handleContainerOperation(
    operation: () => Promise<void>,
    operationName: string
  ) {
    try {
      await operation();
    } catch (err: unknown) {
      const error = ensureDockerException(err);
      this.errorHandler.handleError(
        error,
        `Failed to ${operationName} the ${this.database} container`
      );
    }
  }

  private getContainerName(composeFilePath: string) {
    const baseName = composeFilePath
      .split("\\")
      [composeFilePath.split("\\").length - 2].toLowerCase();

    const extensionMap: Record<DatabaseType, string> = {
      [DatabaseType.POSTGRESQL]: POSTGRESQL_DOCKER_EXTENSION,
      [DatabaseType.MONGODB]: MONGODB_DOCKER_EXTENSION,
      [DatabaseType.MYSQL]: MYSQL_DOCKER_EXTENSION,
    };

    const extension = extensionMap[this.database];

    return baseName + extension;
  }
}
