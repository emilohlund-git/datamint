import { withDatamint } from "@datamint/core/hoc/withDatamint";
import { DatabaseType } from "@datamint/core/enums";
import { DatamintClient } from "@datamint/core/database";
import { MySQLPlugin } from "@datamint/core/plugins";
import { AggregateQuery, SortOrder } from "@datamint/core/plugins/types";

const mockConfig = {
  name: "mysql-db",
  user: "test",
  password: "test",
  port: 3307,
};

describe("MySQLPlugin", () => {
  const { setup, teardown, run } = withDatamint(
    DatabaseType.MYSQL,
    mockConfig,
    (client: DatamintClient<MySQLPlugin>) => {
      beforeEach(async () => {
        await client.reset();
      });

      test("aggregate method", async () => {
        const collectionName = "test";

        await client.createTable(collectionName, {
          key: "VARCHAR(255)",
          otherField: "VARCHAR(255)",
        });

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
    }
  );

  beforeAll(setup);
  afterAll(teardown);
  run();
});
