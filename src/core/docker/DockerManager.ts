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
import { DockerErrorHandler } from "./DockerErrorHandler";

export class DockerManager<T extends DatabasePlugin> extends Observer<
  DockerManager<T>
> {
  private service: DockerService;
  public tempDir: string;
  private options: DatabaseOptions;
  private dockerContainerPath: string;
  public hasRunningContainer: boolean = false;
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
      this.notifyObservers();
      return null;
    }

    LoggerService.info(
      `Stopping ${this.database} Docker container...`,
      Emoji[this.database.toUpperCase() as keyof typeof Emoji]
    );

    await this.handleContainerOperation(async () => {
      await this.service.stopContainer(this.dockerContainerPath);
      this.hasRunningContainer = false;
      this.notifyObservers();
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
    } catch (error: any) {
      this.errorHandler.handleError(
        error,
        `Failed to ${operationName} the ${this.database} container`
      );
    }
  }
}
