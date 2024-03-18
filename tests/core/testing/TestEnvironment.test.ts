import { DatabaseType } from "@datamint/core/enums";
import { withDatamint } from "@datamint/core/testing";

const config = {
  name: "test",
  user: "test",
  password: "test",
  port: 27019,
};

describe("TestEnvironment", () => {
  const { setup, teardown, run } = withDatamint(
    DatabaseType.MONGODB,
    config,
    (client) => {
      beforeEach(async () => {
        await client.reset();
      });

      test("should aggregate a query", async () => {
        const query = [{ $match: { name: "test" } }];
        const result = await client.aggregate("test", query);
        expect(result).toBeDefined();
        expect(result).toEqual([]);
      });
    }
  );

  beforeAll(async () => await setup());
  afterAll(async () => await teardown());
  run();
});

describe("Two tests using the withDatamint HOC", () => {
  const { setup, teardown, run } = withDatamint(
    DatabaseType.MYSQL,
    config,
    (client) => {
      beforeEach(async () => {
        await client.reset();
        await client.createTable("test", {
          name: "VARCHAR(255)",
        });
      });

      test("should aggregate a query", async () => {
        const query = [{ $match: { name: "test" } }];
        const result = await client.aggregate("test", query);
        expect(result).toBeDefined();
        expect(result).toEqual([]);
      });
    }
  );

  beforeAll(async () => await setup());
  afterAll(async () => await teardown());
  run();
});
