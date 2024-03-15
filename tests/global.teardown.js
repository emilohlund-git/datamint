module.exports = async () => {
  const postgresDatamint = global.__POSTGRESQL_DATAMINT__;
  const mysqlDatamint = global.__MYSQL_DATAMINT__;
  const mongodbDatamint = global.__MONGODB_DATAMINT__;

  await postgresDatamint.stop();
  await mysqlDatamint.stop();
  await mongodbDatamint.stop();
};
