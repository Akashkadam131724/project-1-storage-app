export type RoadmapItem = {
  id: string;
  title: string;
  detail: string;
};

export type RoadmapSection = {
  id: string;
  title: string;
  items: RoadmapItem[];
};

export const leftoverSections: RoadmapSection[] = [
  {
    id: "deploy-now",
    title: "Deploy this slice first",
    items: [
      {
        id: "secrets",
        title: "Production secrets and HTTPS",
        detail:
          "COOKIE_SECRET is a placeholder. Set a real secret, secure cookies, CLIENT_ORIGIN, and TLS before the app leaves localhost.",
      },
      {
        id: "mongo-atlas",
        title: "Managed MongoDB",
        detail:
          "Local Mongo is fine for dev. Production needs Atlas or similar so data survives the host.",
      },
      {
        id: "cloud-host",
        title: "Host the API and the client",
        detail:
          "No production target yet. Pick a host (Fly, Railway, Render, or AWS) and prove sign-in, Home, and upload on a public URL.",
      },
      {
        id: "persist-files",
        title: "Persistent file storage",
        detail:
          "Local UPLOAD_DIR dies when a container is replaced. Attach a volume for this first deploy, or go straight to S3/R2. Without this, uploads will not last.",
      },
    ],
  },
  {
    id: "storage",
    title: "Files and storage",
    items: [
      {
        id: "s3",
        title: "S3-compatible object storage",
        detail:
          "After the first cloud deploy is green, replace local blobs with S3, R2, or GCS. A disk volume is only a stopgap.",
      },
      {
        id: "resumable-upload",
        title: "Resumable and multipart uploads",
        detail:
          "Uploads go through memory with a 100 MB cap, one file at a time. Need chunked uploads for large files and flaky networks.",
      },
      {
        id: "folder-upload",
        title: "Folder upload and drag-and-drop",
        detail:
          "Home only has a file picker. Drop files onto a folder, and upload a whole directory tree.",
      },
      {
        id: "thumbnails",
        title: "Image and video thumbnails",
        detail:
          "Grid still shows generic icons. Generate and cache previews for photos and videos.",
      },
      {
        id: "folder-zip",
        title: "Download a folder as a zip",
        detail: "Files can download. Folders cannot be exported in one shot.",
      },
    ],
  },
  {
    id: "product",
    title: "Product",
    items: [
      {
        id: "search",
        title: "Search that actually finds files",
        detail:
          "The header search box is visual only. Index names (then contents) and show results.",
      },
      {
        id: "sharing",
        title: "Sharing and public links",
        detail:
          "Drives are private. Add view/edit links, expiry, and optional passwords.",
      },
      {
        id: "help",
        title: "Help page",
        detail:
          "Help in the header and drawer does nothing. Write a short guide for guests and accounts.",
      },
      {
        id: "more-storage",
        title: "Paid or requestable extra storage",
        detail:
          "Get more storage in the sidebar is a dead button. Wire it to a plan, request, or admin grant.",
      },
      {
        id: "mobile-new-folder",
        title: "New folder on small screens",
        detail: "The New button is hidden below the sm breakpoint.",
      },
    ],
  },
  {
    id: "admin",
    title: "Admin",
    items: [
      {
        id: "admin-search",
        title: "Search and filter users",
        detail:
          "Admin is a flat list. Filter by role, guest, and disabled, and search by name or email.",
      },
      {
        id: "admin-quota",
        title: "Per-user storage usage and caps",
        detail:
          "Admins cannot see how much a user uses or raise their limit. Wire this to Get more storage.",
      },
      {
        id: "admin-invite",
        title: "Invite or create accounts",
        detail:
          "New users only arrive through signup or OAuth. Let an admin invite by email or create a user.",
      },
      {
        id: "admin-stats",
        title: "Admin overview",
        detail:
          "No counts for users, guests, files, or total bytes. Add a small dashboard above the table.",
      },
      {
        id: "admin-user-drive",
        title: "Inspect a user’s drive",
        detail:
          "Admins can disable or delete an account but cannot open that user’s files to debug abuse.",
      },
    ],
  },
  {
    id: "auth",
    title: "Auth and mail",
    items: [
      {
        id: "email-otp",
        title: "Send OTP by email",
        detail:
          "Signup and reset codes only log in development. Add SMTP or a mail API for production.",
      },
      {
        id: "rate-limit",
        title: "Rate limits on auth and uploads",
        detail:
          "OTP, login, and upload routes are unbounded. Add per-IP and per-user limits.",
      },
    ],
  },
  {
    id: "deploy-later",
    title: "Deploy later",
    items: [
      {
        id: "docker",
        title: "Docker images and Compose",
        detail:
          "There is no Dockerfile. Package API, client, and Mongo once the first host is proven.",
      },
      {
        id: "ci",
        title: "CI on every push",
        detail:
          "No GitHub Actions. Run client and server check (typecheck, lint, tests) in CI.",
      },
    ],
  },
  {
    id: "hardening",
    title: "Hardening",
    items: [
      {
        id: "virus-scan",
        title: "Scan uploads",
        detail:
          "Uploaded blobs are stored as-is. Add a malware scan before they are served.",
      },
      {
        id: "back-nav",
        title: "Account back button uses history",
        detail:
          "Settings, Profile, and Appearance still feel like they dump you on Home. Finish in-app back.",
      },
      {
        id: "backups",
        title: "Backups and restore",
        detail:
          "No snapshot of Mongo or object storage. Schedule backups and a restore drill.",
      },
      {
        id: "observability",
        title: "Logs, metrics, and error tracking",
        detail:
          "Logger is local. Add structured logs, uptime on /health, and an error reporter.",
      },
    ],
  },
];

export const leftoverItems = leftoverSections.flatMap(
  (section) => section.items,
);

export const shippedItems = [
  "Password, Google, GitHub, and guest sign-in",
  "Folders, files, trash, starred, and recent",
  "Paged listings and virtualized Home",
  "Storage caps for accounts and guests",
  "Themes, profile, password, and settings pages",
  "Admin user disable, delete, and role changes",
] as const;
