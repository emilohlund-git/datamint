import { DatamintClient } from "@datamint/core/database";
import { DatabaseType } from "@datamint/core/enums";
import { withDatamint } from "@datamint/core/hoc/withDatamint";
import { MySQLPlugin } from "@datamint/core/plugins";

describe("withDatamint", function () {
  const { setup, teardown, run } = withDatamint(
    DatabaseType.MYSQL,
    { name: "test", user: "test", password: "test" },
    (client: DatamintClient<MySQLPlugin>) => {
      it("should run a test", async () => {
        const testData = [{ id: 1, name: "John" }];

        await client.createTable("test", {
          id: "INT AUTO_INCREMENT PRIMARY KEY",
          name: "VARCHAR(255)",
        });

        await client.insert("test", testData);
        const result = await client.find("test", { id: 1 });
        expect(result).toEqual([{ id: 1, name: "John" }]);
      });
    }
  );

  beforeAll(setup, 40000);
  afterAll(teardown, 40000);
  run();
});
