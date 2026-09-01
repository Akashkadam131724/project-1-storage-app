import { Types } from "mongoose";
import { isDuplicateKeyError } from "../../shared/db/duplicate-key.js";
import { ROOT_FOLDER_NAME } from "../../shared/constants/index.js";
import { env } from "../../config/env.js";
import { ApiError, ErrorCode, HttpStatus } from "../../shared/http/index.js";
import { DirectoryModel } from "../directory/directory.model.js";
import { UserModel, toPublicUser } from "../user/user.model.js";
import type { RegisterBody, SignInResult } from "./auth.types.js";
import { consumeSignupCode, saveSignupCode } from "./otp.service.js";
import { hashPassword, verifyPassword } from "./password.js";
import { createUserSession } from "./session.service.js";

export async function requestSignupCode(email: string) {
  await assertEmailAvailable(email);
  const code = await saveSignupCode(email);

  if (env.NODE_ENV === "production") {
    return {};
  }

  return { code };
}

export async function registerAccount(input: RegisterBody) {
  await assertEmailAvailable(input.email);
  await consumeSignupCode(input.email, input.code);
  await persistNewAccount(input);
}

export async function signIn(
  email: string,
  password: string,
): Promise<SignInResult> {
  const user = await UserModel.findOne({ email }).select("+passwordHash");
  const passwordOk =
    Boolean(user) &&
    !user?.isDeleted &&
    (await verifyPassword(password, user?.passwordHash ?? ""));

  if (!user || !passwordOk) {
    throw new ApiError({
      code: ErrorCode.INVALID_CREDENTIALS,
      message: "Invalid email or password",
      status: HttpStatus.UNAUTHORIZED,
    });
  }

  const sessionId = await createUserSession(user._id.toString());
  return { sessionId, profile: toPublicUser(user) };
}

async function assertEmailAvailable(email: string) {
  const existing = await UserModel.findOne({ email });
  if (existing) {
    throw new ApiError({
      code: ErrorCode.EMAIL_TAKEN,
      message: "An account with this email already exists",
      status: HttpStatus.CONFLICT,
    });
  }
}

async function persistNewAccount(input: RegisterBody) {
  const userId = new Types.ObjectId();
  const rootDirId = new Types.ObjectId();
  const passwordHash = await hashPassword(input.password);

  await DirectoryModel.create({
    _id: rootDirId,
    name: ROOT_FOLDER_NAME,
    userId,
    parentDirId: null,
  });

  try {
    await UserModel.create({
      _id: userId,
      name: input.name,
      email: input.email,
      passwordHash,
      rootDirId,
    });
  } catch (error) {
    await DirectoryModel.deleteOne({ _id: rootDirId });
    if (isDuplicateKeyError(error)) {
      throw new ApiError({
        code: ErrorCode.EMAIL_TAKEN,
        message: "An account with this email already exists",
        status: HttpStatus.CONFLICT,
      });
    }
    throw error;
  }
}
