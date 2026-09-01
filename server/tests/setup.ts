import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, afterEach } from "vitest";

process.env.NODE_ENV = "test";
process.env.COOKIE_SECRET = "test-cookie-secret-16";
process.env.CLIENT_ORIGIN = "http://127.0.0.1:5173";
process.env.PORT = "4000";

const mongo = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongo.getUri();
await mongoose.connect(mongo.getUri());

afterEach(async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({})),
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
