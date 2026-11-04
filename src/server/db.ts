import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Cached on globalThis so serverless invocations (and dev hot reloads) reuse one connection
// instead of opening a new one per request.
const globalCache = globalThis as typeof globalThis & { __mongoose?: MongooseCache };
const cache: MongooseCache = (globalCache.__mongoose ??= { conn: null, promise: null });

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri)
    throw new Error('MONGODB_URI is not set. Copy .env.example to .env.local and fill it in.');

  cache.promise ??= mongoose.connect(uri, {
    bufferCommands: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10_000,
  });

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }
  return cache.conn;
}

/** The native driver client behind the Mongoose connection, shared with the Auth.js adapter. */
export async function getMongoClient() {
  return (await connectDB()).connection.getClient();
}
