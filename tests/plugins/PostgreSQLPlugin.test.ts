import { PostgreSQLPlugin } from "@datamint/core/plugins";
import { DatabaseType } from "../../src/core/enums";
import { DatamintClient } from "@datamint/core/database/DatamintClient";

describe("PostgreSQLPlugin", () => {
  let datamint: DatamintClient<PostgreSQLPlugin>;
  const tableName = "your_table_name";

  beforeAll(async () => {
    datamint = new DatamintClient(DatabaseType.POSTGRESQL, {
      name: "test",
      password: "test",
      user: "test",
    });

    await datamint.connect();

    await datamint.createTable(tableName, {
      id: "SERIAL PRIMARY KEY",
      name: "VARCHAR(255)",
    });
  });

  afterAll(async () => {
    await datamint.reset();
    await datamint.disconnect();
  });

  it("should insert data into the specified table correctly", async () => {
    const mockData = [{ id: 1, name: "John" }];
    await datamint.insert(tableName, mockData);

    const result = await datamint.find(tableName, { id: 1 });

    expect(result[0]).toEqual({ id: 1, name: "John" });
  });

  it("should throw an error when connection fails", async () => {
    const wrongConnectionString =
      "postgresql://invalid:invalid@localhost:5432/invalid";
    const invalidPlugin = new PostgreSQLPlugin();
    await expect(
      invalidPlugin.connect(wrongConnectionString)
    ).rejects.toThrow();
  });

  it("should insert multiple rows correctly", async () => {
    const mockData = [
      { id: 2, name: "Jane" },
      { id: 3, name: "Doe" },
    ];
    await datamint.insert(tableName, mockData);

    const result = await datamint.find(tableName, { id: [2, 3] });

    expect(result.length).toBe(2);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 2, name: "Jane" }),
        expect.objectContaining({ id: 3, name: "Doe" }),
      ])
    );
  });

  it("should handle insert errors gracefully", async () => {
    const mockData = [{ id: 4, name: "Error" }];
    const nonExistentTable = "non_existent_table";
    await expect(datamint.insert(nonExistentTable, mockData)).rejects.toThrow();
  });
});
