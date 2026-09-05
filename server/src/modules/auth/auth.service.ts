import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { Types, type HydratedDocument } from "mongoose";
import { env } from "../../config/env.js";
import {
  BCRYPT_ROUNDS,
  BCRYPT_ROUNDS_TEST,
  DEFAULT_AUTH_PROVIDER,
  OTP_PURPOSE_LOGIN,
  OTP_PURPOSE_RESET,
  OTP_PURPOSE_SIGNUP,
  ROOT_FOLDER_NAME,
  type AuthProvider,
} from "../../shared/constants/index.js";
import { deliverOtpCode } from "../../shared/lib/mail.js";
import { isDuplicateKeyError } from "../../shared/db/duplicate-key.js";
import { ApiError, ErrorCode, HttpStatus } from "../../shared/http/index.js";
import { DirectoryModel } from "../directory/directory.model.js";
import { UserModel, toPublicUser, type UserDoc } from "../user/user.model.js";
import type {
  OAuthProfile,
  RegisterBody,
  RequestOtpBody,
  SignInResult,
} from "./auth.types.js";
import {
  profileFromGithubCode,
  profileFromGoogleAuthCode,
} from "./oauth.service.js";
import {
  consumeLoginCode,
  consumeResetCode,
  consumeSignupCode,
  saveLoginCode,
  saveResetCode,
  saveSignupCode,
} from "./otp.service.js";
import {
  createUserSession,
  destroyAllUserSessions,
} from "./session.service.js";

type NewAccountInput = {
  name: string;
  email: string;
  passwordHash?: string;
  picture?: string;
  authProvider: AuthProvider;
  isGuest?: boolean;
};

export async function requestAuthCode(input: RequestOtpBody) {
  if (input.action === "register") {
    return requestSignupCode(input.email);
  }

  await loadPasswordUser(input.email, input.password ?? "");
  const code = await saveLoginCode(input.email);
  return deliverOtpCode(input.email, code, OTP_PURPOSE_LOGIN);
}

export async function requestSignupCode(email: string) {
  await assertEmailAvailable(email);
  const code = await saveSignupCode(email);
  return deliverOtpCode(email, code, OTP_PURPOSE_SIGNUP);
}

export async function registerAccount(input: RegisterBody) {
  await assertEmailAvailable(input.email);
  await consumeSignupCode(input.email, input.code);
  await createUserWithHome({
    name: input.name,
    email: input.email,
    passwordHash: await hashPassword(input.password),
    authProvider: DEFAULT_AUTH_PROVIDER,
  });
}

export async function continueAsGuest(): Promise<SignInResult> {
  const user = await createUserWithHome({
    name: "Guest",
    email: guestEmail(),
    authProvider: DEFAULT_AUTH_PROVIDER,
    isGuest: true,
  });
  return issueSession(user);
}

export async function convertGuestAccount(userId: string, input: RegisterBody) {
  const user = await UserModel.findById(userId).select("+passwordHash");
  if (!user || user.isDeleted || !user.isGuest) {
    throw new ApiError({
      code: ErrorCode.FORBIDDEN,
      message: "Only a guest session can be converted",
      status: HttpStatus.FORBIDDEN,
    });
  }

  await assertEmailAvailable(input.email);
  await consumeSignupCode(input.email, input.code);

  user.name = input.name;
  user.email = input.email;
  user.passwordHash = await hashPassword(input.password);
  user.authProvider = DEFAULT_AUTH_PROVIDER;
  user.isGuest = false;
  try {
    await user.save();
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new ApiError({
        code: ErrorCode.EMAIL_TAKEN,
        message: "An account with this email already exists",
        status: HttpStatus.CONFLICT,
      });
    }
    throw error;
  }

  return toPublicUser(user);
}

export async function signIn(
  email: string,
  password: string,
  code: string,
): Promise<SignInResult> {
  const user = await loadPasswordUser(email, password);
  await consumeLoginCode(email, code);
  return issueSession(user);
}

export async function signInWithGoogle(code: string) {
  return signInWithOAuth(await profileFromGoogleAuthCode(code));
}

export async function signInWithGithub(code: string) {
  return signInWithOAuth(await profileFromGithubCode(code));
}

export async function signInWithOAuth(profile: OAuthProfile) {
  const user = await findOrCreateOAuthUser(profile);
  return issueSession(user);
}

export async function requestPasswordReset(email: string) {
  const user = await UserModel.findOne({ email, isDeleted: false });
  if (!user || user.isGuest) {
    throw new ApiError({
      code: ErrorCode.ACCOUNT_NOT_FOUND,
      message: "No account found for this email. Create an account first.",
      status: HttpStatus.NOT_FOUND,
    });
  }

  const code = await saveResetCode(email);
  return deliverOtpCode(email, code, OTP_PURPOSE_RESET);
}

export async function resetPassword(
  email: string,
  code: string,
  password: string,
) {
  const user = await UserModel.findOne({ email }).select("+passwordHash");
  if (!user) {
    throw new ApiError({
      code: ErrorCode.INVALID_CODE,
      message: "Invalid or expired verification code",
      status: HttpStatus.BAD_REQUEST,
    });
  }

  await consumeResetCode(email, code);

  if (user.isDeleted) {
    throw new ApiError({
      code: ErrorCode.ACCOUNT_DISABLED,
      message: "This account is disabled",
      status: HttpStatus.FORBIDDEN,
    });
  }

  user.passwordHash = await hashPassword(password);
  await user.save();
  await destroyAllUserSessions(user._id.toString());
}

async function loadPasswordUser(email: string, password: string) {
  const user = await UserModel.findOne({ email }).select("+passwordHash");
  if (!user || user.isDeleted) {
    if (user?.isDeleted) {
      throw new ApiError({
        code: ErrorCode.ACCOUNT_DISABLED,
        message: "This account is disabled",
        status: HttpStatus.FORBIDDEN,
      });
    }
    throw new ApiError({
      code: ErrorCode.INVALID_CREDENTIALS,
      message: "Invalid email or password",
      status: HttpStatus.UNAUTHORIZED,
    });
  }

  if (!user.passwordHash) {
    throw new ApiError({
      code: ErrorCode.INVALID_CREDENTIALS,
      message:
        "This account was created with Google or GitHub. Sign in with that instead.",
      status: HttpStatus.UNAUTHORIZED,
    });
  }

  const passwordOk = await verifyPassword(password, user.passwordHash);
  if (!passwordOk) {
    throw new ApiError({
      code: ErrorCode.INVALID_CREDENTIALS,
      message: "Invalid email or password",
      status: HttpStatus.UNAUTHORIZED,
    });
  }

  return user;
}

async function findOrCreateOAuthUser(profile: OAuthProfile) {
  const existing = await UserModel.findOne({ email: profile.email }).select(
    "+passwordHash",
  );
  if (!existing) {
    return createUserWithHome({
      name: profile.name,
      email: profile.email,
      picture: profile.picture,
      authProvider: profile.provider,
    });
  }

  if (existing.isDeleted) {
    throw new ApiError({
      code: ErrorCode.ACCOUNT_DISABLED,
      message: "This account is disabled",
      status: HttpStatus.FORBIDDEN,
    });
  }

  return attachOAuthPicture(existing, profile.picture);
}

async function attachOAuthPicture(
  user: HydratedDocument<UserDoc>,
  picture: string,
) {
  if (!user.picture && picture) {
    user.picture = picture;
    await user.save();
  }
  return user;
}

async function issueSession(
  user: HydratedDocument<UserDoc>,
): Promise<SignInResult> {
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

async function createUserWithHome(input: NewAccountInput) {
  const userId = new Types.ObjectId();
  const rootDirId = new Types.ObjectId();

  await DirectoryModel.create({
    _id: rootDirId,
    name: ROOT_FOLDER_NAME,
    userId,
    parentDirId: null,
  });

  try {
    return await UserModel.create({
      _id: userId,
      name: input.name,
      email: input.email,
      ...(input.passwordHash ? { passwordHash: input.passwordHash } : {}),
      picture: input.picture ?? "",
      authProvider: input.authProvider,
      rootDirId,
      ...(input.isGuest ? { isGuest: true } : {}),
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

export async function hashPassword(plain: string) {
  const rounds = env.NODE_ENV === "test" ? BCRYPT_ROUNDS_TEST : BCRYPT_ROUNDS;
  return bcrypt.hash(plain, rounds);
}

export async function verifyPassword(plain: string, passwordHash: string) {
  return bcrypt.compare(plain, passwordHash);
}

function guestEmail() {
  return `guest.${randomUUID()}@guest.storage.app`;
}
