import { Schema, model } from "mongoose";
import { SESSION_TTL_SECONDS } from "../../shared/constants/index.js";

const userSessionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  createdAt: { type: Date, default: Date.now, expires: SESSION_TTL_SECONDS },
});

export const UserSessionModel = model("UserSession", userSessionSchema);
