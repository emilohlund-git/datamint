# Datamint

![npm](https://img.shields.io/npm/v/datamint)

Datamint is a utility library that simplifies setting up and tearing down Dockerized databases for testing purposes. It currently supports MongoDB, MySQL, and PostgreSQL.

## Features

- Easy setup and teardown of Dockerized databases
- Supports MongoDB, MySQL, and PostgreSQL
- Minimal configuration required

## Installation

```bash
npm install datamint
```

## Preqrequisites

- Docker
- Node.js

### Test Setup

```typescript
import { Datamint, DatabaseType } from "datamint";

const plugin = new PostgreSQLPlugin();

const presgresDatamint = new Datamint(plugin, DatabaseType.POSTGRESQL, {
  databaseName: "test",
  databaseUser: "testuser",
  databasePassword: "password",
});

await presgresDatamint.startDatabase();
```

### Test Teardown

```typescript
await postgresDatamint.stopDatabase();
```

## Usage Examples

### Jest

#### Global Setup

```javascript
const { Datamint, DatabaseType, PostgreSQLPlugin } = require("datamint");

module.exports = async () => {
  const dbConfig = {
    name: "test",
    user: "testuser",
    password: "password",
  };

  const presgresDatamint = new Datamint(
    new PostgreSQLPlugin(),
    DatabaseType.POSTGRESQL,
    dbConfig
  );

  await presgresDatamint.startDatabase();

  global.__POSTGRESQL__DATAMINT__ = postgresDatamint;
};
```

#### Global Teardown

```javascript
const { DatabaseType } = require("datamint");

module.exports = async () => {
  const postgresDatamint = global.__POSTGRESQL_DATAMINT__;

  await postgresDatamint.stopDatabase(DatabaseType.POSTGRESQL);
};
```

#### Test Suite

```typescript
// Test suite
import { PostgreSQLPlugin } from "datamint";

describe("PostgreSQLPlugin", () => {
  let plugin: PostgreSQLPlugin;
  const tableName = "your_table_name";

  beforeAll(async () => {
    datamint = new Datamint(new MySQLPlugin(), DatabaseType.MYSQL, {
      name: "test",
      password: "test",
      user: "test",
    });
    
    await datamint.connectPlugin();

    await datamint.plugin.client.query(
      `CREATE TABLE IF NOT EXISTS ${tableName} (id INT, name VARCHAR(255))`
    );
  });

  afterAll(async () => {
    await datamint.resetPlugin();
    await datamint.disconnectPlugin();
  });

  it("should insert data into the specified table correctly", async () => {
    const mockData = [{ id: 1, name: "John" }];
    await datamint.plugin.insert(tableName, mockData);

    const result = await datamint.plugin.client.query(
      `SELECT * FROM ${tableName} WHERE id = 1`
    );
    expect(result.rows).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 1, name: "John" })])
    );
  });
});
```
