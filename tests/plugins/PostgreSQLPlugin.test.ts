import { DatabaseType } from "../../src/utils/enums";
import { PostgreSQLPlugin } from "../../src/plugins/PostgreSQLPlugin";
import { Datamint } from "../../src/utils/Datamint";

describe("PostgreSQLPlugin", () => {
  let datamint: Datamint;
  const tableName = "your_table_name";

  beforeAll(async () => {
    datamint = new Datamint(new PostgreSQLPlugin(), DatabaseType.POSTGRESQL, {
      name: "test",
      password: "test",
      user: "test",
    });

    await datamint.connectPlugin();

    await datamint.plugin.client.query(
      `CREATE TABLE IF NOT EXISTS ${tableName} (id INT, name VARCHAR(255))`
    );
  });

  afterAll(async () => {
    await datamint.resetPlugin();
    await datamint.disconnectPlugin();
  });

  it("should insert data into the specified table correctly", async () => {
    const mockData = [{ id: 1, name: "John" }];
    await datamint.plugin.insert(tableName, mockData);

    const result = await datamint.plugin.client.query(
      `SELECT * FROM ${tableName} WHERE id = 1`
    );
    expect(result.rows).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 1, name: "John" })])
    );
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
    await datamint.plugin.insert(tableName, mockData);

    const result = await datamint.plugin.client.query(
      `SELECT * FROM ${tableName} WHERE id IN (2, 3)`
    );
    expect(result.rows.length).toBe(2);
    expect(result.rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 2, name: "Jane" }),
        expect.objectContaining({ id: 3, name: "Doe" }),
      ])
    );
  });

  it("should handle insert errors gracefully", async () => {
    const mockData = [{ id: 4, name: "Error" }];
    const nonExistentTable = "non_existent_table";
    await expect(datamint.plugin.insert(nonExistentTable, mockData)).rejects.toThrow();
  });

  it("should retrieve data correctly", async () => {
    const id = 1; // Assuming data is already inserted from previous tests
    const result = await datamint.plugin.client.query(
      `SELECT * FROM ${tableName} WHERE id = $1`,
      [id]
    );
    expect(result.rows).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 1, name: "John" })])
    );
  });

  it("should clean up the database correctly", async () => {
    await datamint.plugin.client.query(`TRUNCATE TABLE ${tableName}`);
    // Optionally, verify the table is empty
    const result = await datamint.plugin.client.query(`SELECT * FROM ${tableName}`);
    expect(result.rows.length).toBe(0);
  });
});
