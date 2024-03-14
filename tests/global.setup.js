const { Datamint } = require("../src/utils/Datamint");
const { PostgreSQLPlugin } = require("../src/plugins/PostgreSQLPlugin");
const { DatabaseType } = require("../src/utils/enums/DatabaseType");
const { MySQLPlugin } = require("../src/plugins/MySQLPlugin");
const { MongoDBPlugin } = require("../src/plugins/MongoDBPlugin");
const { LoggerService } = require("../src/utils/LoggerService");
const { LogColor, LogStyle, Emoji } = require("../src/utils/enums");

module.exports = async () => {
  const mysqlPlugin = new MySQLPlugin();
  const postgreSQLPlugin = new PostgreSQLPlugin();
  const mongodbPlugin = new MongoDBPlugin();

  const dbConfig = {
    name: "test",
    user: "testuser",
    password: "password",
  };

  const postgresDatamint = new Datamint(
    postgreSQLPlugin,
    DatabaseType.POSTGRESQL,
    dbConfig
  );
  const mysqlDatamint = new Datamint(mysqlPlugin, DatabaseType.MYSQL, dbConfig);
  const mongodbDatamint = new Datamint(
    mongodbPlugin,
    DatabaseType.MONGODB,
    dbConfig
  );

  LoggerService.info(
    `Plugin: ${JSON.stringify(postgreSQLPlugin)}`,
    LogColor.MAGENTA,
    LogStyle.BRIGHT,
    Emoji.HOURGLASS
  );
  LoggerService.info(
    `Plugin: ${JSON.stringify(mysqlPlugin)}`,
    LogColor.MAGENTA,
    LogStyle.BRIGHT,
    Emoji.HOURGLASS
  );
  LoggerService.info(
    `Plugin: ${JSON.stringify(mongodbPlugin)}`,
    LogColor.MAGENTA,
    LogStyle.BRIGHT,
    Emoji.HOURGLASS
  );

  LoggerService.info(
    `Starting Datamint: ${JSON.stringify(postgresDatamint)}`,
    LogColor.MAGENTA,
    LogStyle.BRIGHT,
    Emoji.HOURGLASS
  );
  LoggerService.info(
    `Starting Datamint: ${JSON.stringify(mysqlDatamint)}`,
    LogColor.MAGENTA,
    LogStyle.BRIGHT,
    Emoji.HOURGLASS
  );
  LoggerService.info(
    `Starting Datamint: ${JSON.stringify(mongodbDatamint)}`,
    LogColor.MAGENTA,
    LogStyle.BRIGHT,
    Emoji.HOURGLASS
  );

  await postgresDatamint.startDatabase();
  await mysqlDatamint.startDatabase();
  await mongodbDatamint.startDatabase();
};
