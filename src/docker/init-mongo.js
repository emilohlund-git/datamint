db = db.getSiblingDB("${DB_NAME}");
db.createUser({
  user: "${DB_USER}",
  pwd: "${DB_PASSWORD}",
  roles: [
    {
      role: "userAdminAnyDatabase",
      db: "admin",
    },
    {
      role: "readWriteAnyDatabase",
      db: "admin",
    },
  ],
});
