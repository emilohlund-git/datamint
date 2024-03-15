db = db.getSiblingDB("test");
db.createUser({
  user: "test",
  pwd: "test",
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
