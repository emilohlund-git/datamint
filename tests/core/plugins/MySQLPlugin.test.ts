import { Datamint } from "@datamint/core/Datamint";
import { DatamintClient } from "@datamint/core/database";
import { DatabaseType } from "@datamint/core/enums";
import { AggregateQuery, SortOrder } from "@datamint/core/plugins/types";

const mockConfig = {
  name: "mysql-db",
  user: "test",
  password: "test",
  port: 3307,
};

const mint = new Datamint(DatabaseType.MYSQL, mockConfig);
const client = new DatamintClient(DatabaseType.MYSQL, mockConfig);

describe("MySQLPlugin", () => {
  const collectionName = "test";

  beforeAll(async () => await mint.start());
  afterAll(async () => await mint.stop());

  beforeEach(async () => {
    await client.connect();
    await client.createTable("test", {
      key: "VARCHAR(255)",
      otherField: "VARCHAR(255)",
    });
  });

  afterEach(async () => {
    await client.reset();
    await client.disconnect();
  });

  test("aggregate method", async () => {
    // Insert some data into the collection
    await client.insert(collectionName, [
      { key: "value1", otherField: "a" },
      { key: "value1", otherField: "b" },
      { key: "value2", otherField: "c" },
      { key: "value2", otherField: "d" },
      { key: "value3", otherField: "e" },
    ]);

    const query: AggregateQuery = [
      { $match: { key: "value1" } },
      { $group: { key: "$key", count: { $count: "otherField" } } },
      { $sort: { key: SortOrder.ASC } },
    ];

    const result = await client.aggregate(collectionName, query);

    const expectedResult = [{ key: "value1", count: 2 }];

    expect(result).toEqual(expectedResult);
  });
});
