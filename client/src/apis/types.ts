export type Paginated<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type UserRole = "User" | "Admin";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  rootDirId: string;
  picture: string;
  authProvider: "password" | "google" | "github";
  hasPassword: boolean;
  isGuest: boolean;
};

export type AdminUser = PublicUser & { isDeleted: boolean };

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

export type FolderListing = {
  folder: PublicFolder;
  ancestors: PublicFolder[];
  folders: Paginated<PublicFolder>;
  files: Paginated<PublicFile>;
};

export type LibraryListing = {
  folders: Paginated<PublicFolder>;
  files: Paginated<PublicFile>;
};
