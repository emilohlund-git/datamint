import { exec as execCallback } from "child_process";
import { promisify } from "util";
import { DatabaseType, LogColor, LogStyle } from "../enums";
import { LoggerService } from "../logging/LoggerService";
import { Spinners } from "../constants";

const exec = promisify(execCallback);

export class DockerService {
  async pullImage(composeFilePath: string, database: DatabaseType) {
    const stopDockerPullSpinner = LoggerService.spinner(
      `Pulling latest ${database} Docker image...`,
      LogStyle.BRIGHT,
      LogColor.GRAY,
      Spinners.DOCKER,
      300
    );
    try {
      await exec(`docker-compose -f ${composeFilePath} pull`);
    } finally {
      stopDockerPullSpinner();
    }
  }

  async startContainer(composeFilePath: string, database: DatabaseType) {
    const stopDockerStartSpinner = LoggerService.spinner(
      `Starting ${database} Docker container...`,
      LogStyle.BRIGHT,
      LogColor.GRAY,
      Spinners.DOCKER,
      300
    );
    try {
      await exec(`docker-compose -f ${composeFilePath} up -d`);
    } finally {
      stopDockerStartSpinner();
    }
  }

  async stopContainer(composeFilePath: string) {
    await exec(`docker-compose -f ${composeFilePath} down`);
  }
}
