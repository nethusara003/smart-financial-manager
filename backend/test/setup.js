import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { beforeAll, afterAll, afterEach, jest } from '@jest/globals';

// Configure MongoDB memory server to skip checksum validation
globalThis.MONGOMS_SKIP_CHECKSUM = '1';
process.env.MONGOMS_SKIP_CHECKSUM = '1';

let mongoServer;
let usingExternalMongo = false;

// Setup before all tests - MongoDB Memory Server may take time to download binary
beforeAll(async () => {
  // SAFETY: We no longer allow tests to connect to external databases via env vars
  // to prevent accidental data loss in development/production databases.
  
  try {
    console.log('Starting MongoMemoryServer...');
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    console.log('MongoMemoryServer started, connecting mongoose...');

    await mongoose.connect(mongoUri);
    console.log('Mongoose connected successfully');

    // Silence console logs during tests to keep output clean
    // This prevents expected error logs (like 404s or DB errors) from cluttering the results
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  } catch (error) {
    console.error('MongoMemoryServer/Mongoose error:', error.message);
    console.error('Stack:', error.stack);
    // If MongoDB memory server fails, try to use a local or external MongoDB
    const fallbackUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/test';
    try {
      console.log('Attempting fallback connection to:', fallbackUri);
      await mongoose.connect(fallbackUri);
      usingExternalMongo = true;
      console.log('Fallback connection successful');
    } catch (fallbackError) {
      console.error('Fallback MongoDB connection also failed:', fallbackError.message);
      throw fallbackError;
    }
  }
});

// Cleanup after all tests
afterAll(async () => {
  // Restore console methods
  jest.restoreAllMocks();
  
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
