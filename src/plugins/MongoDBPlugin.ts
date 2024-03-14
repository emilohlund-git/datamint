import { MongoClient, Db } from "mongodb";
import { DatabasePlugin } from "./DatabasePlugin";

export class MongoDBPlugin implements DatabasePlugin<MongoClient, Db> {
  private _client: MongoClient;
  private _db: Db;

  async connect(connectionString: string): Promise<MongoClient> {
    this._client = new MongoClient(connectionString);
    await this._client.connect();
    this._db = this._client.db();
    return this._client;
  }

  async reset(database: string): Promise<void> {
    if (!this._db) {
      throw new Error("Not connected to a database");
    }

    // MongoDB doesn't have schemas like SQL databases, so we'll drop all collections instead
    const collections = await this._db.listCollections().toArray();
    for (const collection of collections) {
      await this._db.collection(collection.name).drop();
    }
  }

  async disconnect(): Promise<void> {
    if (this._client) {
      await this._client.close();
    }
  }

  async insert(
    collectionName: string,
    data: Record<string, any>[]
  ): Promise<void> {
    if (!this._db) {
      throw new Error("Not connected to a database");
    }

    await this._db.collection(collectionName).insertMany(data);
  }

  get client(): MongoClient {
    if (!this._client) {
      throw new Error("Not connected to a database");
    }
    return this._client;
  }

  get db(): Db {
    return this._db;
  }
}
