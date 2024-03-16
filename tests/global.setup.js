/* const { Datamint } = require("../src/core/Datamint");
const { DatabaseType } = require("../src/core/enums/DatabaseType");

module.exports = async () => {
  const dbConfig = {
    name: "test",
    user: "test",
    password: "test",
  };

  const postgresDatamint = new Datamint(DatabaseType.POSTGRESQL, dbConfig);
  const mysqlDatamint = new Datamint(DatabaseType.MYSQL, dbConfig);
  const mongodbDatamint = new Datamint(DatabaseType.MONGODB, dbConfig);

  await postgresDatamint.start();
  await mysqlDatamint.start();
  await mongodbDatamint.start();

  global.__POSTGRESQL_DATAMINT__ = postgresDatamint;
  global.__MYSQL_DATAMINT__ = mysqlDatamint;
  global.__MONGODB_DATAMINT__ = mongodbDatamint;
};
 */