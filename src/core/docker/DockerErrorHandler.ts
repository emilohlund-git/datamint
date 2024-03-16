import { LoggerService } from "../logging";
import { DatabaseType, Emoji, LogColor, LogStyle } from "../enums";
import { DockerManager } from "../docker/DockerManager";
import { DatabasePlugin } from "../plugins";
import { ERROR_MESSAGES } from "../docker/constants";
import { DockerException } from "../docker/exceptions";
import { ensureDockerException } from "../utils";

export class DockerErrorHandler<T extends DatabasePlugin> {
  private dockerManager: DockerManager<T>;
  private database: DatabaseType;

  constructor(dockerManager: DockerManager<T>, database: DatabaseType) {
    this.dockerManager = dockerManager;
    this.database = database;

    this.gracefulShutdown = this.gracefulShutdown.bind(this);
    this.setupEventListeners();
  }

  private setupEventListeners() {
    process.on("SIGINT", this.gracefulShutdown);
    process.on("SIGTERM", this.gracefulShutdown);
    process.on("uncaughtException", this.gracefulShutdown);
  }

  public cleanupEventListeners() {
    process.off("SIGINT", this.gracefulShutdown);
    process.off("SIGTERM", this.gracefulShutdown);
    process.off("uncaughtException", this.gracefulShutdown);
  }

  async handleError(error: DockerException, errorMessage: string) {
    const additionalMessage = ERROR_MESSAGES[error.code] || "";
    const formattedMessage = this.formatErrorMessage(
      errorMessage,
      additionalMessage
    );
    LoggerService.error(formattedMessage);

    await this.dockerManager.stopContainer();

    throw error;
  }

  private formatErrorMessage(
    baseMessage: string,
    additionalMessage: string
  ): string {
    return `${baseMessage}: \n${LogStyle.RESET}${LogColor.WHITE}${additionalMessage}${LogStyle.RESET}`;
  }

  protected async gracefulShutdown(): Promise<void> {
    try {
      if (this.dockerManager.hasRunningContainer) {
        LoggerService.warning(
          `Gracefully shutting down the ${this.database} container...`,
          Emoji[this.database.toUpperCase() as keyof typeof Emoji]
        );

        await this.dockerManager.stopContainer();
        this.dockerManager.hasRunningContainer = false;
      }
    } catch (err: unknown) {
      const error = ensureDockerException(err);
      LoggerService.error("Failed to clean up the Docker container.", error);
    } finally {
      this.cleanupEventListeners();
    }
  }
}
