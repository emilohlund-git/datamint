import { DatamintClient } from "../database";
import { Datamint } from "../Datamint";
import { DatabaseType } from "../enums";
import { DatabaseOptions } from "../interfaces";
import { DatabasePlugin } from "../plugins";

export function withDatamint<T extends DatabasePlugin>(
  database: DatabaseType,
  options: DatabaseOptions,
  testSuite: (client: DatamintClient<T>) => void
) {
  let mint: Datamint<T>;
  let client: DatamintClient<T>;

  return {
    setup: async () => {
      mint = new Datamint(database, options);
      client = new DatamintClient<T>(database, options);
      await mint.start();
      await client.connect();

      return { mint, client };
    },
    teardown: async () => {
      await client.reset();
      await client.disconnect();
      await mint.stop();
    },
    run: () => {
      testSuite(client);
    },
  };
}
