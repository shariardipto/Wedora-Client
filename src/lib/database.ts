import "server-only";
import { MongoClient } from "mongodb";

declare global {
  var wedoraAuthMongo: { client: MongoClient; dbName: string } | undefined;
}

function getConnection() {
  if (!globalThis.wedoraAuthMongo) {
    const uri = process.env.MONGODB_URI?.trim();
    const dbName = process.env.MONGODB_DB_NAME?.trim() || "wedora";
    if (!uri || !/^mongodb(?:\+srv)?:\/\/\S+$/.test(uri)) {
      throw new Error("Set MONGODB_URI in .env.local before using authentication.");
    }
    if (!/^[a-zA-Z0-9_-]{1,63}$/.test(dbName)) {
      throw new Error("Invalid MONGODB_DB_NAME in the private environment configuration.");
    }
    let client: MongoClient;
    try {
      client = new MongoClient(uri, {
        appName: "Wedora Auth",
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 8000,
      });
    } catch {
      throw new Error("Invalid MongoDB connection settings. Check .env.local.");
    }
    // Self-healing: if a connection attempt fails (a network blip, a cluster failover), the driver
    // closes the client's topology but keeps it, so every later query fails at once with
    // MongoTopologyClosedError and never reconnects. A warm serverless instance would then reject
    // every sign-in until it was recycled (seen live on 23 Nov 2026). Drop the client when that
    // happens, so the next request connects afresh (and getAuth() rebuilds on the new client).
    client.once("topologyClosed", () => {
      if (globalThis.wedoraAuthMongo?.client !== client) return;
      globalThis.wedoraAuthMongo = undefined;
      void client.close().catch(() => undefined);
    });
    globalThis.wedoraAuthMongo = { client, dbName };
  }
  // One pool shared across dev reloads and warm serverless invocations.
  return globalThis.wedoraAuthMongo;
}

export function getAuthDatabase() {
  const { client, dbName } = getConnection();
  return client.db(dbName);
}

export function getAuthMongoClient() {
  return getConnection().client;
}

export async function closeAuthDatabase() {
  const current = globalThis.wedoraAuthMongo;
  globalThis.wedoraAuthMongo = undefined;
  await current?.client.close();
}
