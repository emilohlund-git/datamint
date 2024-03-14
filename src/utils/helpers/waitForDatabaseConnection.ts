import { DatabasePlugin } from "../../plugins";
import { LoggerService } from "../../utils/LoggerService";
import { Spinners } from "../../utils/constants";
import { DatabaseType, Emoji, LogColor, LogStyle } from "../../utils/enums";

export const waitForDatabaseConnection = async <T>(
  connectionString: string,
  plugin: DatabasePlugin<T>,
  database: DatabaseType,
  maxAttempts = 20,
  interval = 3000
) => {
  let attempts = 0;

  const stopSpinner = LoggerService.spinner(
    `Connecting to the ${database} database...`,
    LogStyle.BRIGHT,
    LogColor.GRAY,
    Spinners.INITIALIZING,
    300
  );

  while (attempts < maxAttempts) {
    try {
      await plugin.connect(connectionString);

      stopSpinner();
      LoggerService.info(
        ` Successfully connected to the ${database} database.`,
        LogColor.GREEN,
        LogStyle.BRIGHT,
        Emoji.CHECK
      );

      return await plugin.disconnect();
    } catch (err: any) {
      attempts++;
      LoggerService.warning(
        `Failed to connect to the database. Retrying... (${attempts}/${maxAttempts})`,
        LogColor.YELLOW,
        LogStyle.DIM
      );
      LoggerService.warning(
        `Reason: ${err.message}`,
        LogColor.GRAY,
        LogStyle.DIM,
        Emoji.ELASTICSEARCH
      );
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  throw new Error(
    `⚠️ Failed to connect to the database within the time limit.`
  );
};
