import { DatabasePlugin } from "./plugins/DatabasePlugin";
import { DatabaseOptions } from "./interfaces/DatabaseOptions";
import { DatabaseType, Emoji } from "./enums";
import { DatamintManager } from "./DatamintManager";
import { DockerManager } from "./docker/DockerManager";
import { LoggerService } from "./logging/LoggerService";
import { Observer } from "./Observer";
import { FileProcessor } from "./FileProcessor";

export class Datamint<T extends DatabasePlugin> extends Observer<
  Datamint<any>
> {
  private dockerManager: DockerManager<T>;
  private fileProcessor: FileProcessor;

  constructor(database: DatabaseType, options: DatabaseOptions) {
    super(database);

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
    await this.dockerManager.startContainer();
  }

  async stop() {
    await this.dockerManager.stopContainer();
  }

  protected async gracefulShutdown() {
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
      process.exit(0);
    }
  }
}
