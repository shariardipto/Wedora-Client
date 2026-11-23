import { afterEach, describe, expect, it } from "vitest";
import { closeAuthDatabase, getAuthDatabase, getAuthMongoClient } from "./database";

// A closed local port: every connection attempt is refused (no real database needed). The client's own
// 8 s server-selection timeout applies, so each failing query takes about 8 s.
const UNREACHABLE = "mongodb://127.0.0.1:1/";

describe("auth database connection", () => {
  const original = { uri: process.env.MONGODB_URI, db: process.env.MONGODB_DB_NAME };

  afterEach(async () => {
    await closeAuthDatabase();
    process.env.MONGODB_URI = original.uri;
    process.env.MONGODB_DB_NAME = original.db;
  });

  it("replaces the client after a failed connect, instead of failing forever", async () => {
    process.env.MONGODB_URI = UNREACHABLE;
    process.env.MONGODB_DB_NAME = "wedora_test";

    const first = getAuthMongoClient();
    // The failed connect closes the driver's topology...
    await expect(getAuthDatabase().command({ ping: 1 })).rejects.toThrow();

    // ...and without the reset every later query would fail at once with MongoTopologyClosedError.
    const second = getAuthMongoClient();
    expect(second).not.toBe(first);
    const error = await getAuthDatabase()
      .command({ ping: 1 })
      .catch((e: unknown) => e as Error);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).name).not.toBe("MongoTopologyClosedError");
  }, 30_000);

  it("keeps one shared client while the connection is healthy", () => {
    process.env.MONGODB_URI = UNREACHABLE;
    expect(getAuthMongoClient()).toBe(getAuthMongoClient());
  });
});
