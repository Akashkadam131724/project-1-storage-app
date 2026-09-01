import type { PublicUser } from "../modules/user/user.model.js";

declare global {
  namespace Express {
    interface Request {
      user?: PublicUser;
    }
  }
}

export {};
