# Stellas Travel Agency

A bilingual (English / Greek) travel agency site with a React frontend and an Express + SQLite backend. Visitors browse packages, submit custom ticket requests, and administrators manage content through a protected admin area.

---

## How it works (overview)

The app is split into two processes:

1. **Frontend** — A single-page app built with React and React Router. It fetches public package listings and submits ticket forms to the API. Admin pages call the same API with a JWT after login.
2. **Backend** — An Express server that stores data in SQLite, issues JWTs for admins, and serves uploaded files from disk.

They communicate over HTTP: the UI uses `fetch` through a small client in `src/api.js`. By default the client targets `http://localhost:5000/api` (configurable via environment variables).

---

## Backend (`server/index.js`)

### Stack

- **Express** — HTTP API and middleware (JSON body parser, explicit CORS headers for browsers).
- **SQLite** (`server/data.db`) — Persistent storage. The file is created on first run; schema is applied in `initDb()`.
- **jsonwebtoken** + **bcryptjs** — Admin login: password is verified against a hash; the API returns a JWT (lifetime configurable via `JWT_EXPIRES_IN`, default 30 days).
- **multer** — File uploads (images or PDFs) stored under `server/uploads/`, exposed as static files at `/uploads/...`.

### Environment variables

Optional `.env` in the project root (loaded via `dotenv`):

| Variable         | Purpose                                      | Default (if unset)                          |
| ---------------- | -------------------------------------------- | ------------------------------------------- |
| `PORT`           | API listen port                              | `5000`                                      |
| `JWT_SECRET`     | Sign/verify admin tokens                     | `change-me-secret` (override in production) |
| `JWT_EXPIRES_IN` | Admin JWT lifetime (e.g. `12h`, `7d`, `30d`) | `30d`                                       |
| `ADMIN_USERNAME` | Seed admin user                              | `admin`                                     |
| `ADMIN_PASSWORD` | Seed admin password                          | `admin123`                                  |
| `ACCESS_CONTROL_ALLOW_ORIGIN` | Optional fixed CORS origin (e.g. `https://stellastravel.vercel.app`). If unset, the API sends `Access-Control-Allow-Origin: *` so all Vercel preview URLs work. | `*` (wildcard) |

On first startup, if no row exists for `ADMIN_USERNAME`, an admin account is inserted with a bcrypt hash of `ADMIN_PASSWORD`.

If the UI says the admin token is invalid after you change `JWT_SECRET` or let the session expire, use **Sign Out** and sign in again so a new JWT is issued. Use the same API base URL (`REACT_APP_API_URL`) that issued the login token.

### Database (high level)

- **`admins`** — Admin users for login.
- **`packages`** — Travel packages shown on the public Packages page and maintained in the admin panel.
- **`ticket_requests`** — Anonymous ticket lead forms from the `/tickets` page (contact + travel details, transport type, passengers, notes).

SQLite uses WAL mode and a busy timeout to reduce lock errors under concurrent access.

### API surface

All JSON API routes are under `/api` unless noted.

**Public**

- `GET /api/health` — Liveness check.
- `GET /api/packages` — List all packages.
- `POST /api/tickets` — Create a ticket request (validated body; no auth).

**Protected** (`Authorization: Bearer <token>`)

- `GET /api/tickets` — List ticket requests (admin inbox).
- `PUT /api/tickets/:id/check` — Toggle or set “checked” status.
- `DELETE /api/tickets/:id` — Delete a ticket request.
- `POST /api/packages` — Create package.
- `PUT /api/packages/:id` — Update package.
- `DELETE /api/packages/:id` — Delete package.
- `POST /api/uploads` — Multipart upload; returns `{ url, kind }` (`kind`: `pdf` or `image`).

**Auth**

- `POST /api/auth/login` — Body: `{ username, password }` → `{ token }`.

**Static**

- `GET /uploads/<filename>` — Served from `server/uploads/`.

Errors return JSON with a `message` field when possible; `500` responses avoid leaking details when `NODE_ENV=production`.

---

## Frontend (`src/`)

### Stack

- **React 18** with **Create React App** (`react-scripts`).
- **React Router v6** — Client-side routes.

### Entry and routing

- `src/index.js` mounts `App`.
- `src/App.jsx` holds bilingual copy, loads packages via `getPackages()` on startup, and defines routes:

| Path        | Page                                       |
| ----------- | ------------------------------------------ |
| `/`         | Home                                       |
| `/packages` | Packages (filters + pagination over props) |
| `/tickets`  | Ticket request form → `POST /api/tickets`  |
| `/admin`    | Admin login, package CRUD, ticket inbox    |

### API client (`src/api.js`)

- Base URL: `process.env.REACT_APP_API_URL || "http://localhost:5000/api"`.
- For production or custom hosts, set **`REACT_APP_API_URL`** when building (e.g. `https://api.example.com/api`).
- Admin calls attach `Authorization: Bearer <token>` from the login response.

### Styling

- Global styles in `src/styles/styles.css`; components pull layout classes from there.

---

## Running locally

You need **Node.js 20.x** (recommended; matches Render and avoids `sqlite3` native mismatches) or another version your team standardizes on for React 18 / CRA.

1. **Install dependencies** (from the project root):

   ```bash
   npm install
   ```

2. **Start the API** (terminal 1):

   ```bash
   npm run server
   ```

   Listens on `http://localhost:5000` by default.

3. **Start the React dev server** (terminal 2):

   ```bash
   npm start
   ```

   Opens the app (usually `http://localhost:3000`). Ensure `REACT_APP_API_URL` points at your API if not using the default `http://localhost:5000/api`.

4. **Admin access** — Use the credentials from your `.env` or the defaults above; change the default password in any shared or deployed environment.

### Production build (frontend only)

```bash
npm run build
```

Outputs static files to `build/`. Serve them with any static host (or your own server). The backend must be deployed separately and reachable at the URL you set in `REACT_APP_API_URL` at build time.

---

## Deploy the API on Render

If deploy logs show **`GLIBC_2.38' not found`** for `node_sqlite3.node`, Render’s Linux image is older than the **prebuilt** `sqlite3` binary that was installed (often when Render defaults to a very new **Node** such as 26).

1. **Build Command:** `npm run render-build`  
   Runs `npm install` with **`npm_config_build_from_source=true`** so `sqlite3` is **compiled on Render** against that host’s glibc.

2. **Start Command:** `npm run server`

3. **Node version:** This repo sets **`engines.node` to `20.x`** and includes **`.nvmrc`** (`20`) so Render tends to use an **LTS Node 20** runtime instead of Node 26.

4. After changing build settings or `package.json`, use **Clear build cache & deploy** once if a bad dependency layer was cached.

If the dashboard still picks the wrong Node version, add an environment variable **`NODE_VERSION`** = **`20.18.1`** (or another current 20.x).

---

## Deploy the frontend on Vercel

Vercel hosts the **Create React App build** (`build/`). The **Express + SQLite API is not run on Vercel** (no persistent SQLite disk in their model). Host the API on a VPS, Railway, Render, Fly.io, etc., then point the UI at it.

### 1. Repo & project

- Push this repo to GitHub (or GitLab / Bitbucket).
- In [Vercel](https://vercel.com): **Add New → Project**, import the repo, root directory **`.`** (default).

### 2. Environment variable (required for production)

In the Vercel project: **Settings → Environment Variables**:

| Name                 | Value (example)              | Apply to        |
| -------------------- | ---------------------------- | --------------- |
| `REACT_APP_API_URL`  | `https://your-api.com/api`   | Production (and Preview if you use a staging API) |

CRA bakes this in at **build time**. After changing it, trigger **Redeploy** (Deployments → … → Redeploy).

Use your real API base URL including the `/api` suffix (same shape as `src/api.js`).

### 3. Build settings

The repo includes **`vercel.json`**: `npm run build`, output **`build`**, and SPA **rewrites** so `/packages`, `/tickets`, `/admin` work on refresh.

If the dashboard shows different values, align them with `vercel.json` or leave defaults if Vercel auto-detects Create React App.

### 4. API + CORS

- Deploy `server/` elsewhere with HTTPS, strong `JWT_SECRET`, and real admin credentials.
- By default the API sends **`Access-Control-Allow-Origin: *`** so **every Vercel preview URL** works without redeploying Render. Your app does **not** use cookie credentials for the API (JWT in `Authorization`), so `*` is acceptable for getting unblocked.
- To lock to one site later, set **`ACCESS_CONTROL_ALLOW_ORIGIN`** on Render to that exact origin (then preview URLs must match or you keep `*` until you use a stable production domain).

### 5. Optional checks

- **`public/stella-profile.jpg`** — add if you use the About photo (or the UI falls back to the logo).
- If **`npm install` fails on Vercel** because of the native **`sqlite3`** package (only needed for the API, not for `react-scripts build`), fix by splitting client/server `package.json` later, or use an install workaround documented in Vercel issues; many builds succeed on Node 18/20.

---

## Repository layout (reference)

```
server/
  index.js       # Express app, routes, DB init
  data.db        # SQLite (created at runtime)
  uploads/       # Uploaded assets (created at runtime)
src/
  api.js         # HTTP client for the API
  App.jsx        # Router, i18n, package fetch
  pages/         # Home, Packages, TicketRequest, AdminPanel
  components/    # Navbar, Footer, etc.
public/
```

This README reflects the intended split: **React UI ↔ REST JSON API ↔ SQLite**, with JWT for admin-only routes and open submission of ticket requests for guests.
