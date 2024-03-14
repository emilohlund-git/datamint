const { DatabaseType } = require("../src/utils/enums/DatabaseType");

module.exports = async () => {
  const postgresDatamint = global.__POSTGRESQL_DATAMINT__;
  const mysqlDatamint = global.__MYSQL_DATAMINT__;
  const mongodbDatamint = global.__MONGODB_DATAMINT__;

  await postgresDatamint.stopDatabase(DatabaseType.POSTGRESQL);
  await mysqlDatamint.stopDatabase(DatabaseType.MYSQL);
  await mongodbDatamint.stopDatabase(DatabaseType.MONGODB);
};
