import { DatamintClient } from "../database";
import { Datamint } from "../Datamint";
import { DatabaseType } from "../enums";
import { DatabaseOptions } from "../interfaces";
import { DatabasePlugin } from "../plugins";
import { LoggerService } from "../logging";
import { ensureDatabaseException, ensureDockerException } from "../utils";

export function withDatamint<T extends DatabasePlugin>(
  database: DatabaseType,
  options: DatabaseOptions,
  testSuite: (client: DatamintClient<T>) => Promise<void>
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
    run: async () => {
      try {
        await testSuite(client);
      } catch (err: unknown) {
        const error = ensureDatabaseException(err);
        LoggerService.error(`Error running test suite: ${error.message}`);
        try {
          await mint.stop();
        } catch (err: unknown) {
          const error = ensureDockerException(err);
          LoggerService.error(
            `Error stopping Docker container: ${error.message}`
          );
          process.exit(1);
        }
      }
    },
  };
}
