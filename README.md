# project-1-storage-app

Vite React client and Express API. Deploy them as two Docker images on EC2.

Ports are chosen so this app can run next to AMS on the same machine:

| App | Local (`npm run dev`) | Docker (host) |
|---|---|---|
| AMS client | 3000 | 3001 |
| AMS API | 3004 | 3004 |
| Storage client | **5173** | **3002** |
| Storage API | **4000** | **4000** |

## Local dev

```bash
# API  → http://localhost:4000
# UI   → http://localhost:5173  (Vite proxies /api to 4000)
```

## Docker (separate client and server)

Copy env values, then build and run both containers:

```bash
cp .env.docker.example .env
# set COOKIE_SECRET and CLIENT_ORIGIN (http://localhost:3002 locally)

docker compose up -d --build
```

- Client: http://localhost:3002 (container nginx on 80, published as **3002** so it does not steal host port 80 or AMS 3001)
- Server: port **4000** (not AMS 3004)
- Mongo: only on the internal compose network unless you set `MONGODB_URI` to Atlas

On EC2, host nginx should proxy `storage.akashkadam.dev` → `localhost:3002`.

Build each image on its own:

```bash
docker build -t storage-server ./server
docker build -t storage-client ./client
```

On EC2 without TLS keep `COOKIE_SECURE=false`. Switch it to `true` once HTTPS is in front (ALB or nginx). Set `CLIENT_ORIGIN` to the public site URL the browser uses.
