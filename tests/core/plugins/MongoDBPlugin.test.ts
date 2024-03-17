import { MongoDBPlugin } from "@datamint/core/plugins/MongoDBPlugin";
import { createWithDatamint } from "@datamint/core/hoc/withDatamint";
import { DatabaseType } from "@datamint/core/enums";

const mockConfig = {
  name: "mongo-db",
  user: "test",
  password: "test",
  port: 27017,
};

const withDatamint = createWithDatamint(DatabaseType.MONGODB, mockConfig);

class TestableMongoDBPlugin extends MongoDBPlugin {
  public escapeValueExposed(value: any): string {
    return this.escapeValue(value);
  }
}

describe("MongoDBPlugin", () => {
  const { setup, teardown, run } = withDatamint((client) => {
    let plugin: TestableMongoDBPlugin;

    beforeEach(async () => {
      plugin = new TestableMongoDBPlugin();
      await client.reset();
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

  beforeAll(setup);
  afterAll(teardown);
  run();
});
