import { Schema, model, type InferSchemaType, type Types } from "mongoose";

const fileSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    parentDirId: {
      type: Schema.Types.ObjectId,
      ref: "Directory",
      required: true,
    },
    size: { type: Number, required: true },
    mimeType: {
      type: String,
      required: true,
      default: "application/octet-stream",
    },
    storageKey: { type: String, required: true },
    trashedAt: { type: Date, default: null },
    starredAt: { type: Date, default: null },
    lastOpenedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

fileSchema.index({ userId: 1, parentDirId: 1, name: 1 });
fileSchema.index({ userId: 1, trashedAt: 1 });
fileSchema.index({ userId: 1, starredAt: 1 });
fileSchema.index({ userId: 1, lastOpenedAt: -1 });

export type FileDoc = InferSchemaType<typeof fileSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicFile = {
  id: string;
  name: string;
  parentId: string;
  size: number;
  mimeType: string;
  isStarred: boolean;
  isTrashed: boolean;
  lastOpenedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export function toPublicFile(file: FileDoc): PublicFile {
  return {
    id: file._id.toString(),
    name: file.name,
    parentId: file.parentDirId.toString(),
    size: file.size,
    mimeType: file.mimeType,
    isStarred: Boolean(file.starredAt),
    isTrashed: Boolean(file.trashedAt),
    lastOpenedAt: file.lastOpenedAt?.toISOString() ?? null,
    createdAt: file.createdAt.toISOString(),
    updatedAt: file.updatedAt.toISOString(),
  };
}

export const FileModel = model("File", fileSchema);
