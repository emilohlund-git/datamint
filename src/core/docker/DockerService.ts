import { exec as execCallback } from "child_process";
import { promisify } from "util";
import { DatabaseType, LogColor, LogStyle } from "../enums";
import { LoggerService } from "../logging/LoggerService";
import { Spinners } from "../constants";
import { ensureDockerException } from "../utils";

const exec = promisify(execCallback);

export class DockerService {
  async pullImage(composeFilePath: string, database: DatabaseType) {
    await this.executeWithSpinner(
      `docker-compose -f ${composeFilePath} pull`,
      `Pulling latest ${database} Docker image...`
    );
  }

  async startContainer(composeFilePath: string, database: DatabaseType) {
    await this.executeWithSpinner(
      `docker-compose -f ${composeFilePath} up -d`,
      `Starting ${database} Docker container...`
    );
  }

  async stopContainer(composeFilePath: string) {
    await exec(`docker-compose -f ${composeFilePath} down`);
  }

  async getContainerStatus(containerName: string): Promise<string> {
    try {
      const { stdout } = await exec(
        `docker ps --filter "name=${containerName.trim()}" --format '{{.Status}}'`
      );

      return stdout.trim();
    } catch (err: unknown) {
      const error = ensureDockerException(err);
      LoggerService.error(
        `Error getting status of container: ${containerName}`
      );
      throw error;
    }
  }

  async getContainerLogs(containerName: string): Promise<string> {
    try {
      const { stdout } = await exec(
        `docker logs ${containerName.trim()} --tail 10`
      );

      return stdout.trim();
    } catch (err: unknown) {
      const error = ensureDockerException(err);
      LoggerService.error(`Error getting logs of container: ${containerName}`);
      throw error;
    }
  }

  private async executeWithSpinner(command: string, message: string) {
    const stopSpinner = LoggerService.spinner(
      message,
      LogStyle.BRIGHT,
      LogColor.GRAY,
      Spinners.DOCKER,
      300
    );
    try {
      await exec(command);
    } catch (err: unknown) {
      const error = ensureDockerException(err);
      LoggerService.error(`Error executing command: ${command}`);
      throw error;
    } finally {
      stopSpinner();
    }
  }
}
