import { DatabaseType } from "@datamint/core/enums";
import { createWithDatamint } from "@datamint/core/hoc/withDatamint";

const withDatamint = createWithDatamint(DatabaseType.MYSQL, {
  name: "test",
  user: "test",
  password: "test",
  port: 3306,
});

describe("withDatamint", function () {
  const { setup, teardown, run } = withDatamint((client) => {
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
  });

  beforeAll(() => setup());

  afterAll(() => teardown());

  run();
});
