import path from "path";
import fs from "fs";
import { promisify } from "util";
import { DatabaseOptions } from "./interfaces";
import { rimraf } from "rimraf";
import { LoggerService } from "./logging";
import { DatabaseType, Emoji, LogColor, LogStyle } from "./enums";
import { Observer } from "./Observer";

const mkdtemp = promisify(fs.mkdtemp);
const copyFile = promisify(fs.copyFile);
const unlink = promisify(fs.unlink);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);

export class FileProcessor extends Observer<FileProcessor> {
  private tempDir: string;
  private tempDirs: string[] = [];

  getFilePath(...paths: string[]) {
    return path.join(__dirname, "..", ...paths);
  }

  async update() {
    await this.gracefulShutdown();
  }

  async createTempDir() {
    const tempDir = await mkdtemp(
      path.join(__dirname, "..", "docker", "datamint-")
    );

    this.tempDir = tempDir;
    this.tempDirs.push(tempDir);
    return tempDir;
  }

  async processFile(
    sourcePath: string,
    destinationPath: string,
    options: DatabaseOptions
  ) {
    await this.copyFile(sourcePath, destinationPath);

    let fileContent = await this.readFile(sourcePath);
    fileContent = await this.parseComposeFile(fileContent, options);

    await this.writeFile(destinationPath, fileContent);
  }

  async copyFile(source: string, destination: string) {
    await copyFile(source, destination);
  }

  async removeFile(filePath: string) {
    await unlink(filePath);
  }

  async readFile(filePath: string) {
    return await readFile(filePath, "utf8");
  }

  async writeFile(filePath: string, data: string) {
    await writeFile(filePath, data);
  }

  async parseComposeFile(sourceFileContent: string, options: DatabaseOptions) {
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

  async cleanupTempDir(tempDir: string) {
    if (!tempDir) return false;
    await rimraf(tempDir);
    LoggerService.info(
      ` Removed temp directory: ${tempDir}`,
      LogColor.GREEN,
      LogStyle.BRIGHT,
      "🗑️"
    );
  }

  async cleanupTempDirs() {
    const dirPath = path.join(__dirname, "../docker");
    try {
      const files = await readdir(dirPath);
      const datamintDirs = files.filter((file) => file.startsWith("datamint-"));

      for (const dir of datamintDirs) {
        const dirToRemove = path.join(dirPath, dir);
        await rimraf(dirToRemove);
      }
    } catch (err: any) {
      LoggerService.error(`Error while cleaning up temp dirs: ${err.message}`);
    }
  }

  protected async gracefulShutdown(): Promise<void> {
    try {
      await this.cleanupTempDir(this.tempDir);
      LoggerService.info(
        `Successfully cleaned the ${this.database} temp files.`,
        LogColor.GREEN,
        LogStyle.DIM,
        Emoji.CLEANUP
      );
    } catch (error: any) {
      LoggerService.error(" Failed to remove temporary files.", error);
    }
  }
}
