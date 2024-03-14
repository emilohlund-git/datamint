import { DatabaseType } from "../../src/utils/enums";
import { MongoDBPlugin } from "../../src/plugins/MongoDBPlugin";
import { Datamint } from "../../src/utils/Datamint";

describe("MongoDBPlugin", () => {
  let datamint: Datamint<MongoDBPlugin>;
  const collectionName = "test_collection";

  beforeAll(async () => {
    datamint = new Datamint(new MongoDBPlugin(), DatabaseType.MONGODB, {
      name: "test",
      password: "test",
      user: "test",
    });
    
    await datamint.connectPlugin();

    await datamint.plugin.client.db().createCollection(collectionName);
  });

  afterAll(async () => {
    await datamint.resetPlugin();
    await datamint.disconnectPlugin();
  });

  it("should insert data into the specified collection correctly", async () => {
    const mockData = [{ _id: 1, name: "John" }];
    await datamint.plugin.insert(collectionName, mockData);

    const result = await datamint.plugin.client
      .db()
      .collection(collectionName)
      .findOne({ _id: 1 as any });
    expect(result).toEqual(expect.objectContaining({ _id: 1, name: "John" }));
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
    await datamint.plugin.insert(collectionName, mockData);

    const result = await datamint.plugin.client
      .db()
      .collection(collectionName)
      .find({ _id: { $in: [2 as any, 3] } })
      .toArray();
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
    const result = await datamint.plugin.client
      .db()
      .collection(collectionName)
      .findOne({ _id } as any);
    expect(result).toEqual(expect.objectContaining({ _id: 1, name: "John" }));
  });

  it("should clean up the database correctly", async () => {
    await datamint.plugin.client.db().collection(collectionName).deleteMany({});
    // Optionally, verify the collection is empty
    const result = await datamint.plugin.client
      .db()
      .collection(collectionName)
      .find({})
      .toArray();
    expect(result.length).toBe(0);
  });
});
