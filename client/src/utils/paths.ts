export const paths = {
  home: "/",
  folder: (folderId: string) => `/directory/${folderId}`,
  file: (fileId: string) => `/files/${fileId}`,
  login: "/login",
  register: "/register",
  forgot: "/forgot",
  trash: "/trash",
  starred: "/starred",
  recent: "/recent",
  profile: "/profile",
  appearance: "/appearance",
  settings: "/settings",
  password: "/password",
  roadmap: "/roadmap",
  admin: "/admin",
} as const;

export function folderOrHome(
  folderId: string | null | undefined,
  rootDirId?: string,
) {
  if (!folderId || folderId === rootDirId) return paths.home;
  return paths.folder(folderId);
}
