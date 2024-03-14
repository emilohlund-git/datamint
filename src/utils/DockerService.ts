import { exec as execCallback } from "child_process";
import { promisify } from "util";
import path from "path";
import * as fs from "fs";
import { DatabaseType, LogColor, LogStyle } from "./enums";
import { LoggerService } from "./LoggerService";
import { Spinners } from "./constants";
import { rimraf } from "rimraf";
import { DatabaseOptions } from "./interfaces/DatabaseOptions";

const exec = promisify(execCallback);
const mkdtemp = promisify(fs.mkdtemp);
const copyFile = promisify(fs.copyFile);
const unlink = promisify(fs.unlink);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

export class DockerService {
  private static tempDirs: string[] = [];

  static async createTempDir() {
    const tempDir = await mkdtemp(
      path.join(__dirname, "..", "docker", "datamint-")
    );

    DockerService.tempDirs.push(tempDir);
    return tempDir;
  }

  static async copyFile(source: string, destination: string) {
    await copyFile(source, destination);
  }

  static async removeFile(filePath: string) {
    await unlink(filePath);
  }

  static async readFile(filePath: string) {
    return await readFile(filePath, "utf8");
  }

  static async writeFile(filePath: string, data: string) {
    await writeFile(filePath, data);
  }

  static async pullImage(composeFilePath: string, database: DatabaseType) {
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

  static async startContainer(composeFilePath: string, database: DatabaseType) {
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

  static async stopContainer(composeFilePath: string) {
    await exec(`docker-compose -f ${composeFilePath} down`);
  }

  static async cleanupTempDir(tempDir: string) {
    const result = await rimraf(tempDir);
    if (result) {
      LoggerService.info(
        ` Removed temp directory: ${tempDir}`,
        LogColor.GREEN,
        LogStyle.BRIGHT,
        "🗑️"
      );
    }
  }

  static async parseComposeFile(
    sourceFileContent: string,
    options: DatabaseOptions
  ) {
    let targetFileContent = sourceFileContent.replace(
      /\${DB_USER}/g,
      options.user
    );
    targetFileContent = targetFileContent.replace(
      /\${DB_PASSWORD}/g,
      options.password
    );
    targetFileContent = targetFileContent.replace(/\${DB_NAME}/g, options.name);

    return targetFileContent;
  }
}
