import { MongoDBPlugin } from "@datamint/core/plugins";
import { DatabaseType } from "../../src/core/enums";
import { DatamintClient } from "@datamint/core/database/DatamintClient";

describe("MongoDBPlugin", () => {
  let datamint: DatamintClient<MongoDBPlugin>;
  const collectionName = "test_collection";

  beforeAll(async () => {
    datamint = new DatamintClient(DatabaseType.MONGODB, {
      name: "test",
      password: "test",
      user: "test",
    });

    await datamint.connect();

    await datamint.createTable(collectionName);
  });

  afterAll(async () => {
    await datamint.reset();
    await datamint.disconnect();
  });

  it("should insert data into the specified collection correctly", async () => {
    const mockData = [{ _id: 1, name: "John" }];
    await datamint.insert(collectionName, mockData);

    const result = await datamint.find(collectionName, { _id: 1 });
    expect(result).toEqual([{ _id: 1, name: "John" }]);
  });

  it("should throw an error when connection fails", async () => {
    const wrongConnectionString =
      "mongodb://invalid:invalid@localhost:27017/invalid";
    const invalidPlugin = new MongoDBPlugin();
    await expect(
      invalidPlugin.connect(wrongConnectionString)
    ).rejects.toThrow();
  });

  it("should insert multiple documents correctly", async () => {
    const mockData = [
      { _id: 2, name: "Jane" },
      { _id: 3, name: "Doe" },
    ];
    await datamint.insert(collectionName, mockData);

    const result = await datamint.find(collectionName, {
      _id: { $in: [2, 3] },
    });

    expect(result.length).toBe(2);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ _id: 2, name: "Jane" }),
        expect.objectContaining({ _id: 3, name: "Doe" }),
      ])
    );
  });

  it("should retrieve data correctly", async () => {
    const _id = 1; // Assuming data is already inserted from previous tests

    const result = await datamint.find(collectionName, { _id });
    expect(result).toEqual([{ _id: 1, name: "John" }]);
  });

  it("should clean up the database correctly", async () => {
    await datamint.delete(collectionName, {});
    const result = await datamint.find(collectionName, {});
    expect(result.length).toBe(0);
  });
});
