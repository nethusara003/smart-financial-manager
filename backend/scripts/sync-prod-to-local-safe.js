import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envFilePath = path.resolve(__dirname, "..", ".env");

dotenv.config({ path: envFilePath });

const DEFAULT_SAFE_LOCAL_URI = "mongodb://127.0.0.1:27017/smart_financial_manager_safe_clone";
const sourceUri = String(process.env.PROD_MONGO_URI || "").trim();
const targetUri = String(process.env.SAFE_LOCAL_MONGO_URI || DEFAULT_SAFE_LOCAL_URI).trim();

function maskMongoUri(uri) {
  if (!uri) {
    return "";
  }

  return uri.replace(/(mongodb(?:\+srv)?:\/\/)([^@]+)@/i, "$1***@");
}

function isLocalMongoUri(uri) {
  const normalized = String(uri || "").toLowerCase();
  return normalized.includes("127.0.0.1") || normalized.includes("localhost");
}

function buildEnvBackupPath(basePath) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${basePath}.backup-${stamp}`;
}

function upsertEnvVariable(content, key, value) {
  const lines = content.split(/\r?\n/);
  const index = lines.findIndex((line) => line.startsWith(`${key}=`));

  if (index === -1) {
    lines.push(`${key}=${value}`);
  } else {
    lines[index] = `${key}=${value}`;
  }

  return lines.join("\n");
}

async function copyCollectionInBatches({ sourceDb, targetDb, collectionName, batchSize = 1000 }) {
  const sourceCollection = sourceDb.collection(collectionName);
  const targetCollection = targetDb.collection(collectionName);
  const cursor = sourceCollection.find({});

  let insertedCount = 0;
  let batch = [];

  // Stream documents to avoid loading entire collections in memory.
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    batch.push(doc);

    if (batch.length >= batchSize) {
      await targetCollection.insertMany(batch, { ordered: false });
      insertedCount += batch.length;
      batch = [];
    }
  }

  if (batch.length > 0) {
    await targetCollection.insertMany(batch, { ordered: false });
    insertedCount += batch.length;
  }

  return insertedCount;
}

async function copyIndexes({ sourceDb, targetDb, collectionName }) {
  const sourceCollection = sourceDb.collection(collectionName);
  const targetCollection = targetDb.collection(collectionName);
  const indexes = await sourceCollection.indexes();

  for (const index of indexes) {
    if (index.name === "_id_") {
      continue;
    }

    const options = { ...index };
    const key = options.key;

    delete options.v;
    delete options.ns;
    delete options.key;

    try {
      await targetCollection.createIndex(key, options);
    } catch (error) {
      console.warn(`Index copy warning for ${collectionName}:${index.name} -> ${error.message}`);
    }
  }
}

async function run() {
  if (!sourceUri) {
    console.error("Missing PROD_MONGO_URI in backend/.env. Add it once, then rerun this command.");
    process.exit(1);
  }

  const allowNonLocalTarget = String(process.env.ALLOW_NON_LOCAL_TARGET || "").toLowerCase() === "true";

  if (!isLocalMongoUri(targetUri) && !allowNonLocalTarget) {
    console.error("Refusing to write to non-local SAFE_LOCAL_MONGO_URI.");
    console.error("Set SAFE_LOCAL_MONGO_URI to localhost/127.0.0.1 or set ALLOW_NON_LOCAL_TARGET=true intentionally.");
    process.exit(1);
  }

  console.log(`Source DB URI: ${maskMongoUri(sourceUri)}`);
  console.log(`Target DB URI: ${maskMongoUri(targetUri)}`);

  let sourceConn;
  let targetConn;

  try {
    sourceConn = await mongoose
      .createConnection(sourceUri, { serverSelectionTimeoutMS: 20000, maxPoolSize: 5 })
      .asPromise();

    targetConn = await mongoose
      .createConnection(targetUri, { serverSelectionTimeoutMS: 20000, maxPoolSize: 5 })
      .asPromise();

    const sourceDb = sourceConn.db;
    const targetDb = targetConn.db;

    const collections = await sourceDb.listCollections({}, { nameOnly: true }).toArray();
    if (collections.length === 0) {
      throw new Error("Source database has no collections to clone.");
    }

    console.log(`Found ${collections.length} collections in source. Rebuilding target database...`);
    await targetDb.dropDatabase();

    for (const entry of collections) {
      const collectionName = entry.name;
      const insertedCount = await copyCollectionInBatches({ sourceDb, targetDb, collectionName });
      await copyIndexes({ sourceDb, targetDb, collectionName });
      console.log(`Cloned ${collectionName}: ${insertedCount} documents`);
    }

    if (!fs.existsSync(envFilePath)) {
      throw new Error(`Cannot update backend/.env because file is missing: ${envFilePath}`);
    }

    const originalEnv = fs.readFileSync(envFilePath, "utf8");
    const backupPath = buildEnvBackupPath(envFilePath);
    fs.writeFileSync(backupPath, originalEnv, "utf8");

    let nextEnv = upsertEnvVariable(originalEnv, "MONGO_URI", targetUri);
    nextEnv = upsertEnvVariable(nextEnv, "MONGODB_URI", targetUri);

    fs.writeFileSync(envFilePath, nextEnv, "utf8");

    console.log(`\nSafe clone completed successfully.`);
    console.log(`backend/.env updated to use cloned DB.`);
    console.log(`Env backup saved at: ${backupPath}`);
    console.log(`\nNext step: restart backend and frontend dev servers.`);
  } finally {
    if (sourceConn) {
      await sourceConn.close();
    }

    if (targetConn) {
      await targetConn.close();
    }
  }
}

run().catch((error) => {
  console.error(`Safe sync failed: ${error.message}`);
  process.exit(1);
});
