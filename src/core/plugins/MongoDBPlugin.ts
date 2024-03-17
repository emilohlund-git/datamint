import { MongoClient } from "mongodb";
import {
  AggregateQuery,
  CountQuery,
  DeleteQuery,
  FindQuery,
  UpdateQuery,
  InsertQuery,
} from "../plugins/types";
import { BasePlugin } from "../plugins/BasePlugin";

export class MongoDBPlugin extends BasePlugin<MongoClient> {
  async connect(connectionString: string): Promise<void> {
    this._client = new MongoClient(connectionString);
    await this._client.connect();
  }

  async reset(database: string): Promise<void> {
    const collections = await this.client.db().listCollections().toArray();
    for (const collection of collections) {
      await this.client.db().collection(collection.name).drop();
    }
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }

  protected escapeValue(value: any): string {
    return JSON.stringify(value);
  }

  async insert(collectionName: string, data: InsertQuery): Promise<void> {
    await this.client.db().collection(collectionName).insertMany(data);
  }

  async find(collectionName: string, query: FindQuery): Promise<any> {
    const collection = this.client.db().collection(collectionName);
    return collection.find(query).toArray();
  }

  async update(collectionName: string, query: UpdateQuery): Promise<any> {
    const collection = this.client.db().collection(collectionName);
    const { filter, update } = query;
    return collection.updateMany(filter, update);
  }

  async delete(collectionName: string, query: DeleteQuery): Promise<any> {
    const collection = this.client.db().collection(collectionName);
    return collection.deleteMany(query);
  }

  async count(collectionName: string, query: CountQuery): Promise<any> {
    return this.client.db().collection(collectionName).countDocuments(query);
  }

  async aggregate(collectionName: string, query: AggregateQuery): Promise<any> {
    return this.client
      .db()
      .collection(collectionName)
      .aggregate(query)
      .toArray();
  }

  async createTable(collectionName: string, schema?: object): Promise<void> {
    await this.client.db().createCollection(collectionName, {
      validator: { $jsonSchema: schema ?? {} },
    });
  }

  async listTables(): Promise<{ name: string }[]> {
    const collections = await this.client.db().listCollections().toArray();

    return collections.map((collection) => {
      return { name: collection.name };
    });
  }
}
