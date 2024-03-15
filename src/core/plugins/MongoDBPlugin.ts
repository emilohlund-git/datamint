import { MongoClient, Db } from "mongodb";
import { DatabasePlugin } from "./DatabasePlugin";
import {
  AggregateQuery,
  CountQuery,
  DeleteQuery,
  FindQuery,
  UpdateQuery,
  InsertQuery,
} from "../plugins/types";

export class MongoDBPlugin implements DatabasePlugin {
  private _client: MongoClient;
  private _db: Db;

  async connect(connectionString: string): Promise<void> {
    this._client = new MongoClient(connectionString);
    await this._client.connect();
    this._db = this._client.db();
  }

  async reset(database: string): Promise<void> {
    this.ensureConnection();

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

  async insert(collectionName: string, data: InsertQuery): Promise<void> {
    this.ensureConnection();

    await this._db.collection(collectionName).insertMany(data);
  }

  async find(collectionName: string, query: FindQuery): Promise<any> {
    this.ensureConnection();

    const collection = this._db.collection(collectionName);
    return collection.find(query).toArray();
  }

  async update(collectionName: string, query: UpdateQuery): Promise<any> {
    this.ensureConnection();

    const collection = this._db.collection(collectionName);
    const { filter, update } = query as UpdateQuery;
    return collection.updateMany(filter, update);
  }

  async delete(collectionName: string, query: DeleteQuery): Promise<any> {
    this.ensureConnection();

    const collection = this._db.collection(collectionName);
    return collection.deleteMany(query as DeleteQuery);
  }

  async count(collectionName: string, query: CountQuery): Promise<any> {
    this.ensureConnection();

    return this._db
      .collection(collectionName)
      .countDocuments(query as CountQuery);
  }

  async aggregate(collectionName: string, query: AggregateQuery): Promise<any> {
    this.ensureConnection();

    return this._db
      .collection(collectionName)
      .aggregate(query as AggregateQuery)
      .toArray();
  }

  async createTable(collectionName: string, schema?: object): Promise<void> {
    this.ensureConnection();

    await this._db.createCollection(collectionName, {
      validator: { $jsonSchema: schema ?? {} },
    });
  }

  get client(): MongoClient {
    this.ensureConnection();

    return this._client;
  }

  private ensureConnection(): void {
    if (!this._db) {
      throw new Error("Not connected to a database");
    }
  }
}
