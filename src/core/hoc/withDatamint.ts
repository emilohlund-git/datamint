import { DatamintClient } from "../database";
import { Datamint } from "../Datamint";
import { DatabaseType } from "../enums";
import { DatabaseOptions } from "../interfaces";
import { DatabasePlugin } from "../plugins";

export function createWithDatamint<T extends DatabasePlugin>(
  database: DatabaseType,
  options: DatabaseOptions
) {
  return (testSuite: (client: DatamintClient<T>) => void) => {
    let mint: Datamint<T> = new Datamint(database, options);
    let client: DatamintClient<T> = new DatamintClient(database, options);

    return {
      setup: async () => {
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
  };
}
