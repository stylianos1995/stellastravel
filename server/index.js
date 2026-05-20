const express = require("express");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const { all, get, run, runInsert, initDb, ping } = require("./db");
const { enrichPackageRow } = require("./packagePdf");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "change-me-secret";
/** How long admin JWTs remain valid (e.g. "12h", "7d", "30d"). Shorter values reduce exposure if a token leaks. */
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30d";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safeExt = path.extname(file.originalname || "").toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isImage = file.mimetype.startsWith("image/");
    const isPdf = file.mimetype === "application/pdf";
    if (!isImage && !isPdf) {
      cb(new Error("Only image or PDF files are allowed."));
      return;
    }
    cb(null, true);
  },
});

/**
 * CORS: explicit headers (no `cors` package). JWT is in Authorization, not cookies.
 *
 * Default `Access-Control-Allow-Origin: *` so every Vercel preview URL works without
 * redeploying the API. Tighten with ACCESS_CONTROL_ALLOW_ORIGIN=https://your-prod-site.vercel.app
 * (then only that origin is allowed; previews need that env updated or a second API).
 */
const allowOriginHeader = () => {
  const fixed = String(process.env.ACCESS_CONTROL_ALLOW_ORIGIN || "").trim();
  return fixed || "*";
};

app.use((req, res, next) => {
  const allowOrigin = allowOriginHeader();

  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  if (allowOrigin !== "*") {
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
  const requestedHeaders = req.headers["access-control-request-headers"];
  if (requestedHeaders) {
    res.setHeader("Access-Control-Allow-Headers", requestedHeaders);
  } else {
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Authorization, Content-Type, X-Requested-With"
    );
  }
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
});
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    if (err && err.name === "TokenExpiredError") {
      res.status(401).json({ message: "Session expired. Please sign in again." });
      return;
    }
    if (err && err.name === "JsonWebTokenError") {
      res
        .status(401)
        .json({ message: "Invalid token. Sign out and sign in again (server secret may have changed)." });
      return;
    }
    res.status(401).json({ message: "Invalid token" });
  }
};

app.get("/api/health", async (_req, res) => {
  try {
    await ping();
    res.json({ ok: true, database: "postgresql" });
  } catch (_err) {
    res.status(503).json({ ok: false, message: "Database unavailable" });
  }
});

app.get("/", (_req, res) => {
  res.json({
    message: "Stellas Travel API is running.",
    endpoints: [
      "/api/health",
      "/api/auth/login",
      "/api/packages",
      "/api/package-inquiries",
    ],
  });
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      res.status(400).json({ message: "Username and password are required." });
      return;
    }

    const admin = await get("SELECT * FROM admins WHERE username = ?", [username]);
    if (!admin) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isValid = await bcrypt.compare(String(password), admin.password_hash);
    if (!isValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ sub: admin.id, username: admin.username }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

app.get("/api/packages", async (_req, res, next) => {
  try {
    const rows = await all("SELECT * FROM packages ORDER BY id DESC");
    res.json(rows.map((row) => enrichPackageRow(uploadsDir, row)));
  } catch (err) {
    next(err);
  }
});

app.post("/api/tickets", async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      travelDate,
      returnDate = "",
      fromDestination,
      toDestination,
      transportType,
      peopleCount,
      adultsCount = 1,
      childrenCount = 0,
      babiesCount = 0,
      notes = "",
      mobileCountryCode,
      mobileNumber,
      airplaneLuggage = null,
      boatHasCar = null,
    } = req.body || {};

    if (
      !firstName ||
      !lastName ||
      !dateOfBirth ||
      !travelDate ||
      !fromDestination ||
      !toDestination ||
      !transportType ||
      (!peopleCount && !adultsCount && !childrenCount && !babiesCount) ||
      !mobileCountryCode ||
      !mobileNumber
    ) {
      res.status(400).json({ message: "Missing required ticket request fields." });
      return;
    }

    const result = await runInsert(
      `INSERT INTO ticket_requests 
      (first_name, last_name, date_of_birth, travel_date, return_date, from_destination, to_destination, transport_type, people_count, adults_count, children_count, babies_count, notes, mobile_country_code, mobile_number, airplane_luggage, boat_has_car, created_at, is_checked)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(firstName).trim(),
        String(lastName).trim(),
        String(dateOfBirth),
        String(travelDate),
        String(returnDate || ""),
        String(fromDestination).trim(),
        String(toDestination).trim(),
        String(transportType),
        Number(peopleCount || Number(adultsCount) + Number(childrenCount) + Number(babiesCount)),
        Number(adultsCount),
        Number(childrenCount),
        Number(babiesCount),
        String(notes || "").trim(),
        String(mobileCountryCode).trim(),
        String(mobileNumber).trim(),
        airplaneLuggage === null ? null : airplaneLuggage ? 1 : 0,
        boatHasCar === null ? null : boatHasCar ? 1 : 0,
        new Date().toISOString(),
        0,
      ]
    );

    const created = await get("SELECT * FROM ticket_requests WHERE id = ?", [result.lastID]);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

app.post("/api/package-inquiries", async (req, res, next) => {
  try {
    const {
      packageId,
      packageName,
      firstName,
      lastName,
      mobileCountryCode,
      mobileNumber,
      email = "",
      preferredTravelDate = "",
      adultsCount = 1,
      childrenCount = 0,
      babiesCount = 0,
      notes = "",
    } = req.body || {};

    const adults = Number(adultsCount);
    const children = Number(childrenCount);
    const babies = Number(babiesCount);
    const peopleCount = adults + children + babies;

    if (
      !packageId ||
      !firstName ||
      !lastName ||
      !mobileCountryCode ||
      !mobileNumber ||
      peopleCount < 1
    ) {
      res.status(400).json({ message: "Missing required package inquiry fields." });
      return;
    }

    const pkg = await get("SELECT id, name FROM packages WHERE id = ?", [Number(packageId)]);
    if (!pkg) {
      res.status(404).json({ message: "Package not found." });
      return;
    }

    const snapshotName = String(packageName || pkg.name).trim() || pkg.name;

    const result = await runInsert(
      `INSERT INTO package_inquiries
      (package_id, package_name, first_name, last_name, mobile_country_code, mobile_number, email, preferred_travel_date, adults_count, children_count, babies_count, people_count, notes, is_checked, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pkg.id,
        snapshotName,
        String(firstName).trim(),
        String(lastName).trim(),
        String(mobileCountryCode).trim(),
        String(mobileNumber).trim(),
        String(email || "").trim(),
        String(preferredTravelDate || ""),
        adults,
        children,
        babies,
        peopleCount,
        String(notes || "").trim(),
        0,
        new Date().toISOString(),
      ]
    );

    const created = await get("SELECT * FROM package_inquiries WHERE id = ?", [result.lastID]);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

app.get("/api/package-inquiries", authenticateToken, async (req, res, next) => {
  try {
    const rows = await all("SELECT * FROM package_inquiries ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.put("/api/package-inquiries/:id/check", authenticateToken, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const current = await get("SELECT * FROM package_inquiries WHERE id = ?", [id]);
    if (!current) {
      res.status(404).json({ message: "Package inquiry not found." });
      return;
    }

    const checked = Boolean(req.body?.checked);
    const result = await run("UPDATE package_inquiries SET is_checked = ? WHERE id = ?", [
      checked ? 1 : 0,
      id,
    ]);
    if (!result.changes) {
      res.status(404).json({ message: "Package inquiry not found." });
      return;
    }

    const updated = await get("SELECT * FROM package_inquiries WHERE id = ?", [id]);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.delete("/api/package-inquiries/:id", authenticateToken, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await run("DELETE FROM package_inquiries WHERE id = ?", [id]);
    if (!result.changes) {
      res.status(404).json({ message: "Package inquiry not found." });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

app.get("/api/tickets", authenticateToken, async (req, res, next) => {
  try {
    const rows = await all("SELECT * FROM ticket_requests ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.put("/api/tickets/:id/check", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const current = await get("SELECT * FROM ticket_requests WHERE id = ?", [id]);
    if (!current) {
      res.status(404).json({ message: "Ticket request not found." });
      return;
    }

    const requestedChecked = req.body && typeof req.body.checked === "boolean" ? req.body.checked : null;
    const nextChecked = requestedChecked === null ? !Boolean(current.is_checked) : requestedChecked;

    const result = await run("UPDATE ticket_requests SET is_checked = ? WHERE id = ?", [
      nextChecked ? 1 : 0,
      id,
    ]);
    if (result.changes === 0) {
      res.status(404).json({ message: "Ticket request not found." });
      return;
    }
    const updated = await get("SELECT * FROM ticket_requests WHERE id = ?", [id]);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.delete("/api/tickets/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await run("DELETE FROM ticket_requests WHERE id = ?", [id]);
    if (result.changes === 0) {
      res.status(404).json({ message: "Ticket request not found." });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

app.post("/api/uploads", authenticateToken, upload.single("file"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: "No file uploaded." });
    return;
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  const kind = req.file.mimetype === "application/pdf" ? "pdf" : "image";
  res.status(201).json({ url: fileUrl, kind });
});

const optionalPackageInt = (value, fallback = 0) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

app.post("/api/packages", authenticateToken, async (req, res, next) => {
  try {
    const body = req.body || {};
    const {
      name,
      country = "",
      price,
      duration,
      image = "",
      description = "",
    } = body;
    const pdfStored = String(body.pdfUrl ?? body.pdf_url ?? "").trim();
    if (!String(name ?? "").trim()) {
      res.status(400).json({ message: "Package name is required." });
      return;
    }

    const result = await runInsert(
      "INSERT INTO packages (name, country, price, duration, image, description, pdf_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        String(name).trim(),
        String(country ?? "").trim(),
        optionalPackageInt(price, 0),
        optionalPackageInt(duration, 0),
        String(image ?? "").trim(),
        String(description ?? "").trim(),
        pdfStored,
      ]
    );

    const created = await get("SELECT * FROM packages WHERE id = ?", [result.lastID]);
    res.status(201).json(enrichPackageRow(uploadsDir, created));
  } catch (err) {
    next(err);
  }
});

app.put("/api/packages/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const {
      name,
      country = "",
      price,
      duration,
      image = "",
      description = "",
    } = body;
    const pdfStored = String(body.pdfUrl ?? body.pdf_url ?? "").trim();

    if (!String(name ?? "").trim()) {
      res.status(400).json({ message: "Package name is required." });
      return;
    }

    const result = await run(
      "UPDATE packages SET name = ?, country = ?, price = ?, duration = ?, image = ?, description = ?, pdf_url = ? WHERE id = ?",
      [
        String(name).trim(),
        String(country ?? "").trim(),
        optionalPackageInt(price, 0),
        optionalPackageInt(duration, 0),
        String(image ?? "").trim(),
        String(description ?? "").trim(),
        pdfStored,
        id,
      ]
    );

    if (result.changes === 0) {
      res.status(404).json({ message: "Package not found." });
      return;
    }

    const updated = await get("SELECT * FROM packages WHERE id = ?", [id]);
    res.json(enrichPackageRow(uploadsDir, updated));
  } catch (err) {
    next(err);
  }
});

app.delete("/api/packages/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await run("DELETE FROM packages WHERE id = ?", [id]);
    if (result.changes === 0) {
      res.status(404).json({ message: "Package not found." });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, _next) => {
  console.error(err);
  if (!res.headersSent) {
    res.setHeader("Access-Control-Allow-Origin", allowOriginHeader());
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
    const rh = req.headers["access-control-request-headers"];
    res.setHeader("Access-Control-Allow-Headers", rh || "Authorization, Content-Type, X-Requested-With");
  }
  if (err && (err.code === "57P01" || err.code === "ECONNREFUSED" || err.code === "ENOTFOUND")) {
    res.status(503).json({ message: "Database unavailable. Please try again shortly." });
    return;
  }
  const message =
    process.env.NODE_ENV === "production" ? "Internal server error" : err?.message || "Internal server error";
  res.status(500).json({ message });
});

initDb({ adminUsername: ADMIN_USERNAME, adminPassword: ADMIN_PASSWORD })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT} (PostgreSQL)`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database", err);
    process.exit(1);
  });
