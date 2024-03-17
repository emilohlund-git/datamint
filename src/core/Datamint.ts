import { DatabasePlugin } from "./plugins/DatabasePlugin";
import { DatabaseOptions } from "./interfaces/DatabaseOptions";
import { DatabaseType, Emoji, LogColor, LogStyle } from "./enums";
import { DatamintManager } from "./DatamintManager";
import { DockerManager } from "./docker/DockerManager";
import { LoggerService, Verbosity } from "./logging/LoggerService";
import { Observer } from "./Observer";
import { FileProcessor } from "./FileProcessor";

export class Datamint<T extends DatabasePlugin> extends Observer<
  Datamint<any>
> {
  private dockerManager: DockerManager<T>;
  private fileProcessor: FileProcessor;

  constructor(database: DatabaseType, options: DatabaseOptions) {
    super(database);
    LoggerService.verbosity = Verbosity.NONE
    LoggerService.debug(`Creating a new ${database} Datamint...`);
    this.fileProcessor = new FileProcessor(database);
    this.fileProcessor.addObserver(this);

    this.dockerManager = new DockerManager(
      database,
      options,
      this.fileProcessor
    );
    this.dockerManager.addObserver(this);
  }

  async update() {
    await this.gracefulShutdown();
    this.notifyObservers();
  }

  async start() {
    DatamintManager.addInstance(this);
    LoggerService.debug(`Starting the ${this.database} Datamint...`);
    await this.dockerManager.startContainer();
    LoggerService.debug(`Started the ${this.database} Datamint...`);
  }

  async stop() {
    LoggerService.debug(`Stopping the ${this.database} Datamint...`);
    await this.dockerManager.stopContainer();
    LoggerService.debug(`Stopped the ${this.database} Datamint...`);
  }

  protected async gracefulShutdown() {
    LoggerService.debug(`Started graceful shutdown of the ${this.database} Datamint...`);
    const index = DatamintManager.getInstanceIndex(this);
    if (index > -1) {
      LoggerService.info(
        `Gracefully terminating the ${this.database} Datamint...`,
        Emoji[this.database.toUpperCase() as keyof typeof Emoji]
      );

      DatamintManager.removeInstance(this);
    }

    if (DatamintManager.getInstances().length === 0) {
      await this.fileProcessor.cleanupTempDirs();
      await this.dockerManager.stopContainer();
      process.exit(0);
    }
  }

  get manager(): DockerManager<T> {
    return this.dockerManager;
  }
}
