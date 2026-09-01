import { Types } from "mongoose";
import { hashPassword } from "../modules/auth/password.js";
import { DirectoryModel } from "../modules/directory/directory.model.js";
import { UserModel } from "../modules/user/user.model.js";
import { ROOT_FOLDER_NAME } from "../shared/constants/index.js";
import { connectDb, disconnectDb } from "../shared/db/mongoose.js";
import { logger } from "../shared/lib/logger.js";
import { seedUsers, type SeedUser } from "./users.js";

async function upsertUser(account: SeedUser) {
  const passwordHash = await hashPassword(account.password);
  const existing = await UserModel.findOne({ email: account.email }).select(
    "+passwordHash",
  );

  if (existing) {
    existing.name = account.name;
    existing.role = account.role;
    existing.passwordHash = passwordHash;
    existing.isDeleted = false;
    await existing.save();
    return "updated";
  }

  const userId = new Types.ObjectId();
  const rootDirId = new Types.ObjectId();

  await DirectoryModel.create({
    _id: rootDirId,
    name: ROOT_FOLDER_NAME,
    userId,
    parentDirId: null,
  });

  await UserModel.create({
    _id: userId,
    name: account.name,
    email: account.email,
    passwordHash,
    role: account.role,
    rootDirId,
  });

  return "created";
}

async function seed() {
  await connectDb();

  for (const account of seedUsers) {
    const action = await upsertUser(account);
    logger.info(`${action}: ${account.email} (${account.role})`);
  }

  logger.info("Seed complete. Use the emails above with the shared local password.");

  await disconnectDb();
}

try {
  await seed();
} catch (error) {
  logger.error(error);
  process.exit(1);
}
