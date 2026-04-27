import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;
let usingExternalMongo = false;

// Setup before all tests
beforeAll(async () => {
  const externalMongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (externalMongoUri) {
    usingExternalMongo = true;
    await mongoose.connect(externalMongoUri);
    return;
  }

  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.disconnect();

  if (!usingExternalMongo && mongoServer) {
    await mongoServer.stop();
  }
});

// Clear database between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Set test environment variables
process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';
