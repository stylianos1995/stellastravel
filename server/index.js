const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "change-me-secret";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

const dbPath = path.join(__dirname, "data.db");
const db = new sqlite3.Database(dbPath);
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

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this);
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });

const ensureColumn = async (tableName, columnName, columnDefinition) => {
  const columns = await all(`PRAGMA table_info(${tableName})`);
  const exists = columns.some((column) => column.name === columnName);
  if (!exists) {
    await run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
  }
};

const defaultPackages = [
  {
    name: "Tropical Paradise",
    country: "Thailand",
    price: 1500,
    duration: 7,
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    description:
      "Enjoy crystal-clear waters, island hopping, and beachfront resorts for a relaxing tropical escape.",
  },
  {
    name: "European Escapade",
    country: "France",
    price: 2200,
    duration: 10,
    image:
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80",
    description:
      "Explore iconic landmarks, local cuisine, and charming neighborhoods with guided city experiences.",
  },
];

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
  } catch (_err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const initDb = async () => {
  // Improve concurrency for read/write operations and avoid "database is locked" failures.
  await run("PRAGMA journal_mode = WAL");
  await run("PRAGMA busy_timeout = 5000");

  await run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      price INTEGER NOT NULL,
      duration INTEGER NOT NULL,
      image TEXT DEFAULT '',
      description TEXT DEFAULT ''
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS ticket_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      date_of_birth TEXT NOT NULL,
      travel_date TEXT NOT NULL,
      return_date TEXT DEFAULT '',
      transport_type TEXT NOT NULL,
      people_count INTEGER NOT NULL,
      airplane_luggage INTEGER,
      boat_has_car INTEGER,
      created_at TEXT NOT NULL
    )
  `);

  await ensureColumn("ticket_requests", "mobile_country_code", "TEXT DEFAULT ''");
  await ensureColumn("ticket_requests", "mobile_number", "TEXT DEFAULT ''");
  await ensureColumn("ticket_requests", "is_checked", "INTEGER DEFAULT 0");
  await ensureColumn("ticket_requests", "from_destination", "TEXT DEFAULT ''");
  await ensureColumn("ticket_requests", "to_destination", "TEXT DEFAULT ''");
  await ensureColumn("ticket_requests", "adults_count", "INTEGER DEFAULT 1");
  await ensureColumn("ticket_requests", "children_count", "INTEGER DEFAULT 0");
  await ensureColumn("ticket_requests", "babies_count", "INTEGER DEFAULT 0");
  await ensureColumn("ticket_requests", "notes", "TEXT DEFAULT ''");

  const admin = await get("SELECT id FROM admins WHERE username = ?", [ADMIN_USERNAME]);
  if (!admin) {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await run("INSERT INTO admins (username, password_hash) VALUES (?, ?)", [
      ADMIN_USERNAME,
      passwordHash,
    ]);
  }

  const packageCount = await get("SELECT COUNT(*) AS count FROM packages");
  if (!packageCount || packageCount.count === 0) {
    for (const pkg of defaultPackages) {
      await run(
        "INSERT INTO packages (name, country, price, duration, image, description) VALUES (?, ?, ?, ?, ?, ?)",
        [pkg.name, pkg.country, pkg.price, pkg.duration, pkg.image, pkg.description]
      );
    }
  }
};

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/", (_req, res) => {
  res.json({
    message: "Stella API is running.",
    endpoints: ["/api/health", "/api/auth/login", "/api/packages"],
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
      expiresIn: "12h",
    });
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

app.get("/api/packages", async (_req, res) => {
  const rows = await all("SELECT * FROM packages ORDER BY id DESC");
  res.json(rows);
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

    const result = await run(
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

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  const kind = req.file.mimetype === "application/pdf" ? "pdf" : "image";
  res.status(201).json({ url: fileUrl, kind });
});

app.post("/api/packages", authenticateToken, async (req, res, next) => {
  try {
    const { name, country, price, duration, image = "", description = "" } = req.body || {};
    if (!name || !country || !price || !duration) {
      res.status(400).json({ message: "name, country, price and duration are required." });
      return;
    }

    const result = await run(
      "INSERT INTO packages (name, country, price, duration, image, description) VALUES (?, ?, ?, ?, ?, ?)",
      [
        String(name).trim(),
        String(country).trim(),
        Number(price),
        Number(duration),
        String(image).trim(),
        String(description).trim(),
      ]
    );

    const created = await get("SELECT * FROM packages WHERE id = ?", [result.lastID]);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

app.put("/api/packages/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, country, price, duration, image = "", description = "" } = req.body || {};

    if (!name || !country || !price || !duration) {
      res.status(400).json({ message: "name, country, price and duration are required." });
      return;
    }

    const result = await run(
      "UPDATE packages SET name = ?, country = ?, price = ?, duration = ?, image = ?, description = ? WHERE id = ?",
      [
        String(name).trim(),
        String(country).trim(),
        Number(price),
        Number(duration),
        String(image).trim(),
        String(description).trim(),
        id,
      ]
    );

    if (result.changes === 0) {
      res.status(404).json({ message: "Package not found." });
      return;
    }

    const updated = await get("SELECT * FROM packages WHERE id = ?", [id]);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.delete("/api/packages/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const result = await run("DELETE FROM packages WHERE id = ?", [id]);
  if (result.changes === 0) {
    res.status(404).json({ message: "Package not found." });
    return;
  }
  res.status(204).send();
});

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err && err.code === "SQLITE_BUSY") {
    res.status(503).json({ message: "Database busy. Please retry in a moment." });
    return;
  }
  const message =
    process.env.NODE_ENV === "production" ? "Internal server error" : err?.message || "Internal server error";
  res.status(500).json({ message });
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database", err);
    process.exit(1);
  });
