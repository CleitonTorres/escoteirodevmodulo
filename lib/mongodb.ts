import "server-only";
import { MongoClient, MongoServerError, type Db } from "mongodb";

let connection: Promise<Db> | undefined;

export function getDb() {
  if (!connection) {
    const uri = process.env.URL_DB;
    const name = process.env.DB_NAME;
    if (!uri || !name) throw new Error("Configure URL_DB e DB_NAME.");

    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    connection = client.connect().then(() => client.db(name)).catch(async (error) => {
      connection = undefined;
      await client.close().catch(() => {});
      throw error;
    });
  }

  return connection;
}

export function isDuplicateKey(error: unknown) {
  return error instanceof MongoServerError && error.code === 11000;
}
