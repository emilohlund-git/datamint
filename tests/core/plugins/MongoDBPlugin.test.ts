import { Datamint } from "@datamint/core/Datamint";
import { DatamintClient } from "@datamint/core/database";
import { DatabaseType } from "@datamint/core/enums";
import { MongoDBPlugin } from "@datamint/core/plugins/MongoDBPlugin";

const mockConfig = {
  name: "mongo-db",
  user: "test",
  password: "test",
  port: 27017,
};

const mint = new Datamint(DatabaseType.MONGODB, mockConfig);
const client = new DatamintClient(DatabaseType.MONGODB, mockConfig);

class TestableMongoDBPlugin extends MongoDBPlugin {
  public escapeValueExposed(value: any): string {
    return this.escapeValue(value);
  }
}

describe("MongoDBPlugin", () => {
  let plugin: TestableMongoDBPlugin;

  beforeAll(() => mint.start());
  afterAll(() => mint.stop());

  beforeEach(async () => {
    plugin = new TestableMongoDBPlugin();
    await client.connect();
  });

  afterEach(async () => {
    await client.reset();
    await client.disconnect();
  });

  test("escapeValue method", () => {
    const value = { key: "value" };
    const escapedValue = plugin.escapeValueExposed(value);
    expect(escapedValue).toEqual(JSON.stringify(value));
  });

  test("aggregate data", async () => {
    const collectionName = "test";
    const data = { key: "value" };
    await client.insert(collectionName, [data]);
    const result = await client.aggregate(collectionName, [
      { $match: { key: "value" } },
    ]);
    expect(result).toEqual([data]);
  });

  test("insert and find data", async () => {
    const collectionName = "test";
    const data = { key: "value" };
    await client.insert(collectionName, [data]);
    const result = await client.find(collectionName, {});
    expect(result).toEqual([data]);
  });

  test("update data", async () => {
    const collectionName = "test";
    const data = { key: "value" };
    const updatedData = { key: "newValue" };

    await client.insert(collectionName, [data]);
    await client.update(collectionName, {
      filter: { key: "value" },
      update: { $set: updatedData },
    });
    const result = await client.find(collectionName, {});
    expect(
      result.map(({ _id, ...rest }: { _id: string; rest: object }) => rest)
    ).toEqual([updatedData]);
  });

  test("delete data", async () => {
    const collectionName = "test";
    const data = { key: "value" };

    await client.insert(collectionName, [data]);
    await client.delete(collectionName, { key: "value" });
    const result = await client.find(collectionName, {});
    expect(result).toEqual([]);
  });

  test("count data", async () => {
    const collectionName = "test";
    const data = { key: "value" };
    await client.insert(collectionName, [data]);
    const count = await client.count(collectionName, {});
    expect(count).toEqual(1);
  });

  test("create table", async () => {
    const collectionName = "test";
    await client.createTable(collectionName);
    const collections = await client.listTables();
    expect(collections.map((c) => c.name)).toContain(collectionName);
  });
});
