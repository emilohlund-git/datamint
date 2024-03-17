import { Datamint } from "@datamint/core/Datamint";
import { DatabaseType } from "@datamint/core/enums";
import { DatabaseOptions } from "@datamint/core/interfaces";
import { DatabasePlugin } from "@datamint/core/plugins";

jest.mock("@datamint/core/Datamint");

describe("Datamint", () => {
  let datamint: Datamint<DatabasePlugin>;
  const mockDatabase = DatabaseType.MYSQL;
  const mockOptions: DatabaseOptions = {
    name: "mockDatabase",
    password: "mockPassword",
    user: "mockUser",
    port: 1234
  };

  beforeEach(() => {
    datamint = new Datamint(mockDatabase, mockOptions);
  });

  it("should be created", () => {
    expect(datamint).toBeTruthy();
  });

  it("should start", async () => {
    datamint.start = jest.fn();
    await datamint.start();
    expect(datamint.start).toHaveBeenCalled();
  });

  it("should stop", async () => {
    datamint.stop = jest.fn();
    await datamint.stop();
    expect(datamint.stop).toHaveBeenCalled();
  });

  it("should update", async () => {
    datamint.update = jest.fn();
    await datamint.update();
    expect(datamint.update).toHaveBeenCalled();
  });

  it("should gracefully shutdown", async () => {
    (datamint as any).gracefulShutdown = jest.fn();
    await (datamint as any).gracefulShutdown();
    expect((datamint as any).gracefulShutdown).toHaveBeenCalled();
  });
});
