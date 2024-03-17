import { DatamintClient } from "@datamint/core/database";
import { DatabaseType } from "@datamint/core/enums";
import { withDatamint } from "@datamint/core/hoc/withDatamint";
import { PostgreSQLPlugin } from "@datamint/core/plugins";

describe("withDatamint", function () {
  const { setup, teardown, run } = withDatamint(
    DatabaseType.POSTGRESQL,
    { name: "test", user: "test", password: "test", port: 5433 },
    (client: DatamintClient<PostgreSQLPlugin>) => {
      it("should run a test", async () => {
        const testData = [{ id: 1, name: "John" }];

        await client.createTable("test", {
          id: "SERIAL PRIMARY KEY",
          name: "VARCHAR(255)",
        });

        await client.insert("test", testData);
        const result = await client.find("test", { id: 1 });
        expect(result).toEqual([{ id: 1, name: "John" }]);
      });
    }
  );

  beforeAll(setup);
  afterAll(teardown);
  run();
});
