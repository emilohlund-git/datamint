import { DatamintClient } from "@datamint/core/database";
import { DatabaseType } from "@datamint/core/enums";
import { withDatamint } from "@datamint/core/hoc/withDatamint";
import { PostgreSQLPlugin } from "@datamint/core/plugins";

describe("withDatamint", function () {
  const { setup, teardown, run } = withDatamint(
    DatabaseType.POSTGRESQL,
    { name: "test", user: "test", password: "test", port: 3306 },
    (client: DatamintClient<PostgreSQLPlugin>) => {
      it("should run a test", async () => {
      
      });
    }
  );

  beforeAll(setup);
  afterAll(teardown);
  run();
});
