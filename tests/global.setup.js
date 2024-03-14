const { Datamint } = require("../src/utils/Datamint");
const { PostgreSQLPlugin } = require("../src/plugins/PostgreSQLPlugin");
const { DatabaseType } = require("../src/utils/enums/DatabaseType");
const { MySQLPlugin } = require("../src/plugins/MySQLPlugin");
const { MongoDBPlugin } = require("../src/plugins/MongoDBPlugin");

module.exports = async () => {
  const mysqlPlugin = new MySQLPlugin();
  const postgreSQLPlugin = new PostgreSQLPlugin();
  const mongodbPlugin = new MongoDBPlugin();

  const dbConfig = {
    name: "test",
    user: "testuser",
    password: "password",
  };

  const presgresDatamint = new Datamint(
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

  await presgresDatamint.startDatabase();
  await mysqlDatamint.startDatabase();
  await mongodbDatamint.startDatabase();
};
