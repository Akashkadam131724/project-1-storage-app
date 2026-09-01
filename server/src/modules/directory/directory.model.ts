import { Schema, model } from "mongoose";

const directorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    parentDirId: {
      type: Schema.Types.ObjectId,
      ref: "Directory",
      default: null,
    },
  },
  { timestamps: true },
);

export const DirectoryModel = model("Directory", directorySchema);
