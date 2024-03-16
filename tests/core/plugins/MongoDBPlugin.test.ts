import { MongoDBPlugin } from "@datamint/core/plugins/MongoDBPlugin";
import { withDatamint } from "@datamint/core/hoc/withDatamint";
import { DatabaseType } from "@datamint/core/enums";
import { DatamintClient } from "@datamint/core/database";

const mockConfig = {
  name: "mongo-db",
  user: "test",
  password: "test",
};

describe("MongoDBPlugin", () => {
  const { setup, teardown, run } = withDatamint(
    DatabaseType.MONGODB,
    mockConfig,
    (client: DatamintClient<MongoDBPlugin>) => {
      beforeEach(async () => {
        await client.reset();
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
    }
  );

  beforeAll(setup);
  afterAll(teardown);
  run();
});
