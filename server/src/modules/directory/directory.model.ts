import { Schema, model, type InferSchemaType, type Types } from "mongoose";

const directorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    parentDirId: {
      type: Schema.Types.ObjectId,
      ref: "Directory",
      default: null,
    },
    ancestorIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "Directory" }],
      default: [],
    },
    size: { type: Number, required: true, default: 0 },
    trashedAt: { type: Date, default: null },
    starredAt: { type: Date, default: null },
  },
  { timestamps: true },
);

directorySchema.index({ userId: 1, parentDirId: 1, name: 1 });
directorySchema.index({ ancestorIds: 1 });
directorySchema.index({ userId: 1, trashedAt: 1 });
directorySchema.index({ userId: 1, starredAt: 1 });

export type DirectoryDoc = InferSchemaType<typeof directorySchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicFolder = {
  id: string;
  name: string;
  parentId: string | null;
  size: number;
  isRoot: boolean;
  isStarred: boolean;
  isTrashed: boolean;
  createdAt: string;
  updatedAt: string;
};

export function toPublicFolder(folder: DirectoryDoc): PublicFolder {
  return {
    id: folder._id.toString(),
    name: folder.name,
    parentId: folder.parentDirId ? folder.parentDirId.toString() : null,
    size: folder.size,
    isRoot: folder.parentDirId == null,
    isStarred: Boolean(folder.starredAt),
    isTrashed: Boolean(folder.trashedAt),
    createdAt: folder.createdAt.toISOString(),
    updatedAt: folder.updatedAt.toISOString(),
  };
}

export const DirectoryModel = model("Directory", directorySchema);
