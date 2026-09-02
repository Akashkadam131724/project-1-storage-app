import { Schema, model, type InferSchemaType, type Types } from "mongoose";
import {
  ADMIN_ROLE,
  AUTH_PROVIDERS,
  DEFAULT_AUTH_PROVIDER,
  DEFAULT_USER_ROLE,
  NAME_MIN_LENGTH,
  USER_ROLES,
  type AuthProvider,
  type UserRole,
} from "../../shared/constants/index.js";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: NAME_MIN_LENGTH,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, select: false },
    authProvider: {
      type: String,
      enum: AUTH_PROVIDERS,
      default: DEFAULT_AUTH_PROVIDER,
    },
    rootDirId: {
      type: Schema.Types.ObjectId,
      ref: "Directory",
      required: true,
    },
    picture: { type: String, default: "" },
    role: { type: String, enum: USER_ROLES, default: DEFAULT_USER_ROLE },
    isGuest: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type { UserRole };
export type UserDoc = InferSchemaType<typeof userSchema> & {
  _id: Types.ObjectId;
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  rootDirId: string;
  picture: string;
  authProvider: AuthProvider;
  hasPassword: boolean;
  isGuest: boolean;
};

export function toPublicUser(user: UserDoc): PublicUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role === ADMIN_ROLE ? ADMIN_ROLE : DEFAULT_USER_ROLE,
    rootDirId: user.rootDirId.toString(),
    picture: user.picture,
    authProvider: user.authProvider,
    hasPassword: Boolean(user.passwordHash),
    isGuest: Boolean(user.isGuest),
  };
}

export const UserModel = model("User", userSchema);
