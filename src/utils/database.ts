// This import loads the `.env` file as environment variables
import "@std/dotenv/load";
import { Db, MongoClient } from "mongodb";
import { ID } from "@utils/types.ts";
// Using built-in crypto.randomUUID() instead of external UUID library

/**
 * Returns whether tests should clean the test database before running.
 * Controlled via the `TEST_DB_CLEAN` env var. Defaults to true.
 * Falsy values: "0", "false", "no" (case-insensitive)
 */
export function shouldCleanTestDb(): boolean {
  const raw = Deno.env.get("TEST_DB_CLEAN");
  if (raw === undefined) return true;
  const normalized = raw.trim().toLowerCase();
  return !["0", "false", "no"].includes(normalized);
}

async function initMongoClient() {
  const DB_CONN = Deno.env.get("MONGODB_URL");
  if (DB_CONN === undefined) {
    throw new Error("Could not find environment variable: MONGODB_URL");
  }
  const client = new MongoClient(DB_CONN);
  try {
    await client.connect();
  } catch (e) {
    throw new Error("MongoDB connection failed: " + e);
  }
  return client;
}

async function init() {
  const client = await initMongoClient();
  const DB_NAME = Deno.env.get("DB_NAME");
  if (DB_NAME === undefined) {
    throw new Error("Could not find environment variable: DB_NAME");
  }
  return [client, DB_NAME] as [MongoClient, string];
}

async function dropAllCollections(db: Db): Promise<void> {
  try {
    // Get all collection names
    const collections = await db.listCollections().toArray();

    // Drop each collection
    for (const collection of collections) {
      await db.collection(collection.name).drop();
    }
  } catch (error) {
    console.error("Error dropping collections:", error);
    throw error;
  }
}

/**
 * MongoDB database configured by .env
 * @returns {[Db, MongoClient]} initialized database and client
 */
export async function getDb() {
  const [client, DB_NAME] = await init();
  return [client.db(DB_NAME), client] as [Db, MongoClient];
}

/**
 * Test database initialization
 * @returns {[Db, MongoClient]} initialized test database and client
 */
export async function testDb() {
  const [client, DB_NAME] = await init();
  const test_DB_NAME = `test-${DB_NAME}`;
  const test_Db = client.db(test_DB_NAME);
  try {
    if (shouldCleanTestDb()) {
      await dropAllCollections(test_Db);
    }
  } catch (e) {
    try {
      await client.close();
    } catch {
      // ignore secondary close errors
    }
    throw e;
  }
  return [test_Db, client] as [Db, MongoClient];
}

/**
 * Creates a fresh ID.
 * @returns {ID} UUID v7 generic ID.
 */
export function freshID() {
  return crypto.randomUUID() as ID;
}
