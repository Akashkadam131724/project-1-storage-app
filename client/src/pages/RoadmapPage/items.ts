export type RoadmapItem = {
  id: string;
  title: string;
  detail: string;
  /** Flip to true in this file when the step is finished. The UI does not save checks. */
  done: boolean;
};

export const roadmapItems: RoadmapItem[] = [
  {
    id: "repo-setup",
    title: "Repo setup: Prettier and Husky",
    detail:
      "Root and package lint-staged, format on commit, shared Prettier config.",
    done: true,
  },
  {
    id: "server-ts-tests",
    title: "Backend TypeScript and tests",
    detail:
      "Express + TS, Vitest, Mongo memory server, health and module tests.",
    done: true,
  },
  {
    id: "first-auth",
    title: "First auth (sessions and accounts)",
    detail:
      "Cookie sessions, password users, guest, logout. This was the first login path, before email OTP.",
    done: true,
  },
  {
    id: "folders-files",
    title: "Folders and files on the user",
    detail:
      "Root directory per account, upload to local disk, listing, trash, starred, recent, quotas.",
    done: true,
  },
  {
    id: "client-setup",
    title: "Client setup",
    detail: "Vite React, routing, theme, shared UI, React Query.",
    done: true,
  },
  {
    id: "client-wired",
    title: "Client wired to the API",
    detail:
      "Home, upload, folders, profile, settings, admin. Vite proxy to the local API.",
    done: true,
  },
  {
    id: "first-deploy",
    title: "First production deploy",
    detail:
      "Docker images on EC2 (storage.akashkadam.dev). Live at that time: password register without OTP. Disk uploads. Auth with OTP/OAuth on that host was not proven.",
    done: true,
  },
  {
    id: "local-full-auth",
    title: "Full auth on local: OTP, Google, GitHub",
    detail:
      "Resend 4-digit codes, register/login/forgot, resend timer, Google popup, GitHub callback, guest convert and wipe on sign-out. Working on localhost.",
    done: true,
  },
  {
    id: "prod-auth",
    title: "Verify that auth on production",
    detail:
      "Redeploy the OTP/OAuth build. Prove register, login, forgot password, Google, GitHub, and guest on the live URL. Resend, HTTPS cookies, CLIENT_ORIGIN, Google/GitHub prod origins. Fix locally and redeploy if needed. Do not start S3 until this is green.",
    done: false,
  },
  {
    id: "s3-local",
    title: "S3 on local",
    detail:
      "Replace local UPLOAD_DIR with S3 (or R2). Prove upload, download, delete, guest wipe.",
    done: false,
  },
  {
    id: "s3-prod",
    title: "S3 on production",
    detail: "Deploy S3 and confirm files survive on EC2.",
    done: false,
  },
  {
    id: "resumable-upload",
    title: "Resumable and multipart uploads",
    detail: "Local then prod. Uploads still go through memory (100 MB cap).",
    done: false,
  },
  {
    id: "folder-upload",
    title: "Folder upload and drag-and-drop",
    detail: "Local then prod. Home still uses a file picker only.",
    done: false,
  },
  {
    id: "thumbnails",
    title: "Image and video thumbnails",
    detail: "Local then prod. Grid still shows generic icons.",
    done: false,
  },
  {
    id: "folder-zip",
    title: "Download a folder as a zip",
    detail: "Local then prod.",
    done: false,
  },
  {
    id: "search",
    title: "Search that finds files",
    detail: "Header search is visual only. Local then prod.",
    done: false,
  },
  {
    id: "sharing",
    title: "Sharing and public links",
    detail: "View/edit links, expiry, optional password. Local then prod.",
    done: false,
  },
  {
    id: "help",
    title: "Help page",
    detail: "Header Help does nothing yet.",
    done: false,
  },
  {
    id: "more-storage",
    title: "Extra storage",
    detail: "Sidebar Get more storage is a dead button.",
    done: false,
  },
  {
    id: "mobile-new-folder",
    title: "New folder on small screens",
    detail: "The New button is hidden below the sm breakpoint.",
    done: false,
  },
  {
    id: "admin-tools",
    title: "Admin search, quotas, invites, and stats",
    detail: "Admin is still a flat list. No usage caps, invites, or overview.",
    done: false,
  },
  {
    id: "rate-limit",
    title: "Rate limits on auth and uploads",
    detail: "OTP, login, and upload routes are unbounded.",
    done: false,
  },
  {
    id: "ci",
    title: "CI on every push",
    detail: "Typecheck, lint, and tests in GitHub Actions.",
    done: false,
  },
  {
    id: "hardening",
    title: "Backups, logs, and upload scanning",
    detail: "No Mongo/S3 snapshots, no error reporter, blobs stored as-is.",
    done: false,
  },
];
