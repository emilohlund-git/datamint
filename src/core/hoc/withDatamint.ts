import { DatamintClient } from "src/core/database";
import { Datamint } from "../Datamint";
import { DatabaseType } from "../enums";
import { DatabaseOptions } from "../interfaces";
import { DatabasePlugin } from "src/core/plugins";

export function withDatamint<T extends DatabasePlugin>(
  database: DatabaseType,
  options: DatabaseOptions,
  testSuite: (client: DatamintClient<T>) => void
) {
  const mint = new Datamint(database, options);
  const client = new DatamintClient<T>(database, options);

  return {
    setup: async () => {
      await mint.start();
      await client.connect();
    },
    teardown: async () => {
      await client.reset();
      await client.disconnect();
      await mint.stop();
    },
    run: () => testSuite(client),
  };
}
