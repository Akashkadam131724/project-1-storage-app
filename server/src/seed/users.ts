import {
  ADMIN_ROLE,
  DEFAULT_USER_ROLE,
  type UserRole,
} from "../shared/constants/index.js";

export const SEED_PASSWORD = "password1";
export const ADA_SEED_EMAIL = "ada@storage.app";

export type SeedUser = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export const seedUsers: SeedUser[] = [
  {
    name: "Storage Admin",
    email: "admin@storage.app",
    password: SEED_PASSWORD,
    role: ADMIN_ROLE,
  },
  {
    name: "Ada Lovelace",
    email: ADA_SEED_EMAIL,
    password: SEED_PASSWORD,
    role: DEFAULT_USER_ROLE,
  },
  {
    name: "Linus Torvalds",
    email: "linus@storage.app",
    password: SEED_PASSWORD,
    role: DEFAULT_USER_ROLE,
  },
];
