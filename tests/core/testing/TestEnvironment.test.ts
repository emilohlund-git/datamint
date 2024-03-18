import { DatabaseType } from "@datamint/core/enums";
import { createTestEnvironment } from "@datamint/core/testing";

const mongoConfig = {
  name: "mongo",
  user: "test",
  password: "test",
  port: 27020,
};

const mysqlConfig = {
  name: "test",
  user: "test",
  password: "test",
  port: 3308,
};

describe("TestEnvironment", () => {
  describe("MongoDB", () => {
    const { setup, teardown, client } = createTestEnvironment(
      DatabaseType.MONGODB,
      mongoConfig
    )();

    beforeAll(async () => {
      await setup();
    });

    afterAll(async () => {
      await teardown();
    });

    test("should run tests with Datamint", async () => {
      await client.reset();

      const query = [{ $match: { name: "test" } }];
      const result = await client.aggregate("test", query);
      expect(result).toBeDefined();
      expect(result).toEqual([]);
    });
  });

  describe("MySQL", () => {
    const { setup, teardown, client } = createTestEnvironment(
      DatabaseType.MYSQL,
      mysqlConfig
    )();

    beforeAll(async () => {
      await setup();
    });

    afterAll(async () => {
      await teardown();
    });

    test("should run tests with Datamint", async () => {
      await client.reset();
      await client.createTable("test", {
        name: "VARCHAR(255)",
      });

      const query = [{ $match: { name: "test" } }];
      const result = await client.aggregate("test", query);
      expect(result).toBeDefined();
      expect(result).toEqual([]);
    });
  });
});
