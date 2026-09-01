export const paths = {
  home: "/",
  folder: (folderId: string) => `/directory/${folderId}`,
  login: "/login",
  register: "/register",
  trash: "/trash",
  starred: "/starred",
  recent: "/recent",
} as const;
