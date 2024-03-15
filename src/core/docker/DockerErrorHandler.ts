import { LoggerService } from "../logging";
import { DatabaseType, Emoji, LogColor, LogStyle } from "../enums";
import { DockerManager } from "../docker/DockerManager";
import { DatabasePlugin } from "../plugins";

export class DockerErrorHandler<T extends DatabasePlugin> {
  private dockerManager: DockerManager<T>;
  private database: DatabaseType;
  private errorMessages: { [key: number]: string } = {
    0: `Container stopped - no tasks left to perform.`,
    1: `Docker daemon not running or container already exists.`,
    137: `Container terminated - manual stop or out of memory.`,
    139: `Container error - possible bug in the application.`,
    143: `Container stopped - it received a termination signal.`,
  };

  constructor(dockerManager: DockerManager<T>, database: DatabaseType) {
    this.dockerManager = dockerManager;
    this.database = database;

    process.on("SIGINT", () => this.gracefulShutdown());
    process.on("SIGTERM", () => this.gracefulShutdown());
    process.on("uncaughtException", () => this.gracefulShutdown());
  }

  async handleError(error: any, errorMessage: string) {
    const additionalMessage = this.errorMessages[error.code] || "";
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
    } catch (error: any) {
      LoggerService.error("Failed to clean up the Docker container.", error);
    }
  }
}
