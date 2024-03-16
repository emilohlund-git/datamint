import { DatamintManager } from "@datamint/core/DatamintManager";
import { Datamint } from "@datamint/core/Datamint";
import { DatabasePlugin } from "@datamint/core/plugins";
import { DatabaseType } from "@datamint/core/enums";
import { DatabaseOptions } from "@datamint/core/interfaces";

describe("DatamintManager", () => {
  const mockDatabase = DatabaseType.MYSQL;
  const mockOptions: DatabaseOptions = {
    name: "mockDatabase",
    password: "mockPassword",
    user: "mockUser",
  };
  let instance: Datamint<DatabasePlugin>;

  beforeEach(() => {
    instance = new Datamint(mockDatabase, mockOptions);
    DatamintManager.addInstance(instance);
  });

  afterEach(() => {
    DatamintManager.removeInstance(instance);
  });

  it("should add instance", () => {
    expect(DatamintManager.getInstances()).toContain(instance);
  });

  it("should remove instance", () => {
    DatamintManager.removeInstance(instance);
    expect(DatamintManager.getInstances()).not.toContain(instance);
  });

  it("should get instance index", () => {
    const index = DatamintManager.getInstanceIndex(instance);
    expect(index).toBeGreaterThanOrEqual(0);
  });

  it("should return instances", () => {
    const instances = DatamintManager.getInstances();
    expect(instances).toBeInstanceOf(Array);
  });
});
