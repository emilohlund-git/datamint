import { FileProcessor } from "@datamint//core/FileProcessor";
import mockFs from "mock-fs";
import { DatabaseOptions } from "@datamint/core/interfaces";
import { DatabaseType } from "@datamint/core/enums";

describe("FileProcessor", () => {
  let fileProcessor: FileProcessor;
  let mockOptions: DatabaseOptions;

  beforeEach(() => {
    // Mock the file system
    const nodeModulesPath = require.resolve("jest");
    const nodeModulesDir = nodeModulesPath.substring(
      0,
      nodeModulesPath.indexOf("node_modules") + "node_modules".length
    );

    // Mock the file system
    mockFs({
      "src/docker": {
        "datamint-": {},
      },
      "src/file.txt":
        "DB_USER=${DB_USER}\nDB_PASSWORD=${DB_PASSWORD}\nDB_NAME=${DB_NAME}",
      node_modules: mockFs.load(nodeModulesDir),
    });

    fileProcessor = new FileProcessor(DatabaseType.MYSQL);

    mockOptions = {
      name: "mockDatabase",
      password: "mockPassword",
      user: "mockUser",
    };
  });

  afterEach(() => {
    // Restore the file system
    mockFs.restore();
  });

  it("should create a temp directory", async () => {
    const tempDir = await fileProcessor.createTempDir();
    expect(tempDir).toContain("datamint-");
  });

  it("should process a file", async () => {
    const sourcePath = "src/file.txt";
    const destinationPath = "src/docker/datamint-/file.txt";

    await fileProcessor.processFile(sourcePath, destinationPath, mockOptions);

    const fileContent = await fileProcessor.readFile(destinationPath);
    expect(fileContent).toContain(mockOptions.user);
    expect(fileContent).toContain(mockOptions.password);
    expect(fileContent).toContain(mockOptions.name);
  });

  it("should cleanup temp directory", async () => {
    const tempDir = await fileProcessor.createTempDir();
    await fileProcessor.cleanupTempDir(tempDir);
    expect(() => fileProcessor.readFile(tempDir)).rejects.toThrow();
  });

  it("should cleanup all temp directories", async () => {
    await fileProcessor.createTempDir();
    await fileProcessor.cleanupTempDirs();
    expect(() =>
      fileProcessor.readFile("src/docker/datamint-")
    ).rejects.toThrow();
  });

  it("should gracefully shutdown", async () => {
    await fileProcessor.createTempDir();
    await fileProcessor.update();
    expect(() =>
      fileProcessor.readFile("src/docker/datamint-")
    ).rejects.toThrow();
  });
});
