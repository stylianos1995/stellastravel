# Stellas Travel Agency

A bilingual (English / Greek) travel agency site with a React frontend and an Express + **PostgreSQL** backend. Visitors browse packages, submit custom ticket requests, and administrators manage content through a protected admin area.

---

## How it works (overview)

The app is split into two processes:

1. **Frontend** — A single-page app built with React and React Router. It fetches public package listings and submits ticket forms to the API. Admin pages call the same API with a JWT after login.
2. **Backend** — An Express server that stores data in **PostgreSQL**, issues JWTs for admins, and serves uploaded files from disk.

They communicate over HTTP: the UI uses `fetch` through a small client in `src/api.js`. By default the client targets `http://localhost:5000/api` (configurable via environment variables).

---

## Backend (`server/index.js`)

### Stack

- **Express** — HTTP API and middleware (JSON body parser, explicit CORS headers for browsers).
- **PostgreSQL** (`pg`) — Persistent storage via `DATABASE_URL`. Tables are created on first run in `server/db.js` → `initDb()`.
- **jsonwebtoken** + **bcryptjs** — Admin login: password is verified against a hash; the API returns a JWT (lifetime configurable via `JWT_EXPIRES_IN`, default 30 days).
- **multer** — File uploads (images or PDFs) stored under `server/uploads/`, exposed as static files at `/uploads/...`.

### Environment variables

Optional `.env` in the project root (loaded via `dotenv`):

| Variable         | Purpose                                      | Default (if unset)                          |
| ---------------- | -------------------------------------------- | ------------------------------------------- |
| `DATABASE_URL`   | **Required.** PostgreSQL connection string   | —                                           |
| `DATABASE_SSL`   | Force SSL on (`true`) or off (`false`). Auto-detected for Neon/Render/Supabase URLs if unset. | auto |
| `PORT`           | API listen port                              | `5000`                                      |
| `JWT_SECRET`     | Sign/verify admin tokens                     | `change-me-secret` (override in production) |
| `JWT_EXPIRES_IN` | Admin JWT lifetime (e.g. `12h`, `7d`, `30d`) | `30d`                                       |
| `ADMIN_USERNAME` | Admin login username                         | `Dimste` (set in env)                       |
| `ADMIN_PASSWORD` | Admin login password                         | Set in env (synced on API startup)          |
| `ACCESS_CONTROL_ALLOW_ORIGIN` | Optional fixed CORS origin (e.g. `https://stellastravel.vercel.app`). If unset, the API sends `Access-Control-Allow-Origin: *` so all Vercel preview URLs work. | `*` (wildcard) |

On first startup, if no row exists for `ADMIN_USERNAME`, an admin account is inserted with a bcrypt hash of `ADMIN_PASSWORD`.

If the UI says the admin token is invalid after you change `JWT_SECRET` or let the session expire, use **Sign Out** and sign in again so a new JWT is issued. Use the same API base URL (`REACT_APP_API_URL`) that issued the login token.

### Database (high level)

- **`admins`** — Admin users for login.
- **`packages`** — Travel packages shown on the public Packages page and maintained in the admin panel.
- **`ticket_requests`** — Anonymous ticket lead forms from the `/tickets` page (contact + travel details, transport type, passengers, notes).

**Uploads** (`server/uploads/`) still live on the API server disk. On Render without persistent disk, re-deploys can remove uploaded images/PDFs; use external storage (S3, Cloudinary) later if needed.

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

You need **Node.js 20.x** and a **PostgreSQL** database (local Docker, [Neon](https://neon.tech) free tier, or Render Postgres).

1. **Copy env file** and set `DATABASE_URL`:

   ```bash
   cp .env.example .env
   ```

   Example local URL: `postgresql://postgres:postgres@localhost:5432/stellas_travel`  
   For Neon/Render, paste the connection string from the dashboard (`?sslmode=require` is fine; SSL is auto-enabled).

2. **Install dependencies** (from the project root):

   ```bash
   npm install
   ```

3. **Start the API** (terminal 1):

   ```bash
   npm run server
   ```

   Listens on `http://localhost:5000` by default.

4. **Start the React dev server** (terminal 2):

   ```bash
   npm start
   ```

   Opens the app (usually `http://localhost:3000`). Ensure `REACT_APP_API_URL` points at your API if not using the default `http://localhost:5000/api`.

5. **Admin access** — Use the credentials from your `.env` or the defaults above; change the default password in any shared or deployed environment.

6. **Health check** — `GET http://localhost:5000/api/health` should return `{ "ok": true, "database": "postgresql" }`.

### Production build (frontend only)

```bash
npm run build
```

Outputs static files to `build/`. Serve them with any static host (or your own server). The backend must be deployed separately and reachable at the URL you set in `REACT_APP_API_URL` at build time.

---

## Render guide (existing API service + PostgreSQL)

You already host the API on Render (e.g. `https://stellastravel.onrender.com`). Follow these steps to add a **persistent Postgres database** and deploy the updated code.

### Before you start

1. **Commit and push** the latest code (the version that uses `pg` / `server/db.js`, not `sqlite3`).
2. On your PC, run `npm install` once so `package-lock.json` includes `pg`.

### Step 1 — Create a PostgreSQL database on Render

1. Open [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** → **PostgreSQL**.
3. Choose a name (e.g. `stellas-travel-db`), region **same as your web service** (lower latency).
4. Pick a plan (Free works for testing; data is kept when the DB sleeps).
5. Click **Create Database** and wait until status is **Available**.

### Step 2 — Connect the database to your web service

**Option A — Link from the web service (easiest)**

1. Open your **existing Web Service** (the API, not Vercel).
2. Go to **Environment**.
3. Click **Add from Render** (or **Link database**) and select the Postgres you just created.
4. Render adds **`DATABASE_URL`** automatically (internal URL — correct for service-to-service).

**Option B — Paste the URL manually**

1. On the **PostgreSQL** service page, open **Connections**.
2. Copy **Internal Database URL** (use this when API and DB are both on Render).
3. On the **Web Service** → **Environment**, add:

   | Key | Value |
   | --- | --- |
   | `DATABASE_URL` | Paste the **Internal** URL |

   Do **not** use the External URL for the API unless the DB is hosted outside Render.

### Step 3 — Set the other environment variables

On the same **Environment** tab for your web service, confirm or add:

| Variable | What to set |
| -------- | ------------- |
| `DATABASE_URL` | From Step 2 (required) |
| `JWT_SECRET` | Long random string (keep stable — changing it logs everyone out) |
| `ADMIN_USERNAME` | Your admin login |
| `ADMIN_PASSWORD` | Your chosen admin password |

You do **not** need `DATABASE_SSL` on Render if the URL contains `render.com` (SSL is auto-detected). If connection fails, add `DATABASE_SSL` = `true`.

### Step 4 — Confirm build settings

On the web service **Settings**:

| Setting | Value |
| ------- | ----- |
| **Build Command** | `npm run render-build` |
| **Start Command** | `npm run server` |
| **Node version** | `20` (or leave default if it matches `engines` in `package.json`) |

### Step 5 — Deploy

1. **Manual Deploy** → **Deploy latest commit** (or push to Git if auto-deploy is on).
2. If the build fails after switching from SQLite, use **Clear build cache & deploy** once.
3. Open **Logs** and check for:
   - `API running on ... (PostgreSQL)`
   - No `DATABASE_URL is required` error

### Step 6 — Verify

1. In the browser: `https://YOUR-SERVICE.onrender.com/api/health`  
   Expected: `{ "ok": true, "database": "postgresql" }`
2. Open your **Vercel site** → Packages page loads.
3. **Admin** → sign in → add a test package → redeploy the API once → package should **still be there**.

### Important notes

| Topic | Detail |
| ----- | ------ |
| **Old SQLite data** | Packages/tickets from before Postgres are **not** migrated. Re-add packages in admin (or ask for a migration script). |
| **Uploaded files** | Images/PDFs in `server/uploads/` can still be lost on redeploy unless you add a Render **disk** or cloud storage (S3, Cloudinary). |
| **Vercel** | No change if `REACT_APP_API_URL` already points to `https://YOUR-SERVICE.onrender.com/api`. Redeploy Vercel only if you change the API URL. |
| **Free tier cold start** | First request after idle can take ~30s; the database data is still there. |

### Troubleshooting

| Symptom | Fix |
| ------- | --- |
| Deploy crashes: `DATABASE_URL is required` | Add `DATABASE_URL` on the web service and redeploy. |
| `Database unavailable` / 503 on `/api/health` | Wrong URL, DB not ready, or use Internal URL + `DATABASE_SSL=true`. |
| Admin login works but packages empty | Expected after migration — add packages again in admin. |
| `Invalid token` after deploy | Sign out and sign in again; keep `JWT_SECRET` the same between deploys. |
| Build still mentions `sqlite3` | Push latest code; clear build cache; ensure `package.json` has `pg` not `sqlite3`. |

---

## Deploy the frontend on Vercel

Vercel hosts the **Create React App build** (`build/`). The **Express API is not run on Vercel**. Host the API on Render (with Postgres), Railway, Fly.io, etc., then point the UI at it.

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

---

## Repository layout (reference)

```
server/
  index.js       # Express app, routes
  db.js          # PostgreSQL pool, schema init, queries
  uploads/       # Uploaded assets (ephemeral on Render unless disk added)
src/
  api.js         # HTTP client for the API
  App.jsx        # Router, i18n, package fetch
  pages/         # Home, Packages, TicketRequest, AdminPanel
  components/    # Navbar, Footer, etc.
public/
```

This README reflects the intended split: **React UI ↔ REST JSON API ↔ PostgreSQL**, with JWT for admin-only routes and open submission of ticket requests for guests.
