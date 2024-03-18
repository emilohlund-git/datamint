import { DatabaseType } from "@datamint/core/enums";
import { withDatamint } from "@datamint/core/testing";

const config = {
  name: "test",
  user: "test",
  password: "test",
  port: 27019,
};

describe("TestEnvironment", () => {
  const datamint = withDatamint(DatabaseType.MONGODB, config);

  beforeAll(async () => {
    await datamint.setup();
  });

  afterAll(async () => {
    await datamint.teardown();
  });

  test("should run tests with Datamint", async () => {
    await datamint.client.reset();

    const query = [{ $match: { name: "test" } }];
    const result = await datamint.client.aggregate("test", query);
    expect(result).toBeDefined();
    expect(result).toEqual([]);
  });
});

describe("Two tests using the withDatamint HOC", () => {
  const datamint = withDatamint(DatabaseType.MYSQL, config);

  beforeAll(async () => {
    await datamint.setup();
  });

  afterAll(async () => {
    await datamint.teardown();
  });

  test("should run tests with Datamint", async () => {
    await datamint.client.reset();
    await datamint.client.createTable("test", {
      name: "VARCHAR(255)",
    });

    const query = [{ $match: { name: "test" } }];
    const result = await datamint.client.aggregate("test", query);
    expect(result).toBeDefined();
    expect(result).toEqual([]);
  });
});
