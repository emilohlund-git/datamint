# Datamint

![npm](https://img.shields.io/npm/v/datamint)
[![Coverage Status](https://coveralls.io/repos/github/emilohlund-git/datamint/badge.svg?branch=main)](https://coveralls.io/github/emilohlund-git/datamint?branch=main)

Datamint is a utility library that simplifies setting up and tearing down Dockerized databases for testing purposes. It currently supports MongoDB, MySQL, and PostgreSQL.

## Features

- Easy setup and teardown of Dockerized databases
- Supports MongoDB, MySQL, and PostgreSQL
- Minimal configuration required

## Description

The whole idea of the library is to use the Datamint class alongside a DatabasePlugin to spin up and tear down Docker containers before and after test lifecycles.

The docker containers are defined based on the options you pass in to the Datamint class.

For example:

```typescript
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
```

Will spin up a Docker container with the latest postgres image, creating a "test" database, and a user with the specified credentials. It will then generate a connection string based on these arguments and connect to the dockerized database.

These proccesses runs asynchronously, and the starting and stopping of docker containers should happen before and after a test-suite lifecycle.

## Installation

```bash
npm install datamint
```

## Preqrequisites

- Docker
- Node.js

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

  await presgresDatamint.startDockerContainer();

  global.__POSTGRESQL__DATAMINT__ = postgresDatamint;
};
```

#### Global Teardown

```javascript
const { DatabaseType } = require("datamint");

module.exports = async () => {
  const postgresDatamint = global.__POSTGRESQL_DATAMINT__;

  await postgresDatamint.stopDockerContainer(DatabaseType.POSTGRESQL);
};
```

#### Test Suite

```typescript
import { PostgreSQLPlugin } from "datamint";

describe("PostgreSQLPlugin", () => {
  let datamint: Datamint;
  const tableName = "your_table_name";

  beforeAll(async () => {
    this.datamint = new Datamint(new MySQLPlugin(), DatabaseType.MYSQL, {
      name: "test",
      password: "test",
      user: "test",
    });
    
    await this.datamint.connectPlugin();

    await this.datamint.plugin.client.query(
      `CREATE TABLE IF NOT EXISTS ${tableName} (id INT, name VARCHAR(255))`
    );
  });

  afterAll(async () => {
    await this.datamint.resetPlugin();
    await this.datamint.disconnectPlugin();
  });

  it("should insert data into the specified table correctly", async () => {
    const mockData = [{ id: 1, name: "John" }];
    await this.datamint.plugin.insert(tableName, mockData);

    const result = await this.datamint.plugin.client.query(
      `SELECT * FROM ${tableName} WHERE id = 1`
    );
    expect(result.rows).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 1, name: "John" })])
    );
  });
});
```
