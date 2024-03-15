import { DatabasePlugin } from "./plugins/DatabasePlugin";
import { DatabaseOptions } from "./interfaces/DatabaseOptions";
import { DatabaseType, Emoji, LogColor, LogStyle } from "./enums";
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

  async update(info: { database: DatabaseType; tempDir: string }) {
    await this.gracefulShutdown(info);
    this.notifyObservers({
      database: this.database,
      tempDir: this.dockerManager.tempDir,
    });
  }

  async start() {
    DatamintManager.addInstance(this);
    await this.dockerManager.startContainer();
  }

  async stop() {
    await this.dockerManager.stopContainer();
  }

  protected async gracefulShutdown(info: {
    database: DatabaseType;
    tempDir: string;
  }) {
    const index = DatamintManager.getInstanceIndex(this);
    if (index > -1) {
      LoggerService.info(
        `Gracefully terminating the ${info.database} Datamint...`,
        LogColor.CYAN,
        LogStyle.BRIGHT,
        Emoji[info.database.toUpperCase() as keyof typeof Emoji]
      );

      DatamintManager.removeInstance(this);
    }

    if (DatamintManager.getInstances().length === 0) {
      process.exit(0);
    }
  }
}
