const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

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

function shouldUseSsl(connectionString) {
  if (process.env.DATABASE_SSL === "true") return true;
  if (process.env.DATABASE_SSL === "false") return false;
  return /neon\.tech|render\.com|supabase|railway|amazonaws\.com/i.test(connectionString);
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is required. Set a PostgreSQL connection string (Neon, Render Postgres, or local)."
    );
  }
  return new Pool({
    connectionString,
    ssl: shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
  });
}

const pool = createPool();

/** Convert SQLite-style `?` placeholders to PostgreSQL `$1`, `$2`, … */
function toPg(sql, params) {
  let index = 0;
  const text = sql.replace(/\?/g, () => `$${++index}`);
  return { text, values: params };
}

async function all(sql, params = []) {
  const { text, values } = toPg(sql, params);
  const result = await pool.query(text, values);
  return result.rows;
}

async function get(sql, params = []) {
  const rows = await all(sql, params);
  return rows[0] || null;
}

async function run(sql, params = []) {
  const { text, values } = toPg(sql, params);
  const result = await pool.query(text, values);
  return {
    changes: result.rowCount ?? 0,
    lastID: result.rows[0]?.id ?? null,
  };
}

/** INSERT helper — appends `RETURNING id` when missing so callers get `lastID`. */
async function runInsert(sql, params = []) {
  let statement = sql.trim().replace(/;\s*$/, "");
  if (!/returning\s+id/i.test(statement)) {
    statement += " RETURNING id";
  }
  return run(statement, params);
}

async function ensureColumn(tableName, columnName, columnDefinition) {
  await pool.query(
    `ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${columnName} ${columnDefinition}`
  );
}

async function initDb({ adminUsername, adminPassword }) {
  await run(`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS packages (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT '',
      price INTEGER NOT NULL DEFAULT 0,
      duration INTEGER NOT NULL DEFAULT 0,
      image TEXT DEFAULT '',
      description TEXT DEFAULT '',
      pdf_url TEXT DEFAULT ''
    )
  `);

  await ensureColumn("packages", "pdf_url", "TEXT DEFAULT ''");

  await run(`
    CREATE TABLE IF NOT EXISTS ticket_requests (
      id SERIAL PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      date_of_birth TEXT NOT NULL,
      travel_date TEXT NOT NULL,
      return_date TEXT DEFAULT '',
      from_destination TEXT DEFAULT '',
      to_destination TEXT DEFAULT '',
      transport_type TEXT NOT NULL,
      people_count INTEGER NOT NULL,
      adults_count INTEGER DEFAULT 1,
      children_count INTEGER DEFAULT 0,
      babies_count INTEGER DEFAULT 0,
      notes TEXT DEFAULT '',
      mobile_country_code TEXT DEFAULT '',
      mobile_number TEXT DEFAULT '',
      airplane_luggage INTEGER,
      boat_has_car INTEGER,
      is_checked INTEGER DEFAULT 0,
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

  await run(`
    CREATE TABLE IF NOT EXISTS package_inquiries (
      id SERIAL PRIMARY KEY,
      package_id INTEGER NOT NULL,
      package_name TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      mobile_country_code TEXT NOT NULL,
      mobile_number TEXT NOT NULL,
      email TEXT DEFAULT '',
      preferred_travel_date TEXT DEFAULT '',
      adults_count INTEGER DEFAULT 1,
      children_count INTEGER DEFAULT 0,
      babies_count INTEGER DEFAULT 0,
      people_count INTEGER NOT NULL,
      notes TEXT DEFAULT '',
      is_checked INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const admin = await get("SELECT id FROM admins WHERE username = ?", [adminUsername]);
  if (admin) {
    await run("UPDATE admins SET password_hash = ? WHERE id = ?", [passwordHash, admin.id]);
  } else {
    await run("DELETE FROM admins WHERE username = ?", ["admin"]);
    await run("INSERT INTO admins (username, password_hash) VALUES (?, ?)", [
      adminUsername,
      passwordHash,
    ]);
  }

  const packageCount = await get("SELECT COUNT(*)::int AS count FROM packages");
  if (!packageCount || Number(packageCount.count) === 0) {
    for (const pkg of defaultPackages) {
      await run(
        "INSERT INTO packages (name, country, price, duration, image, description, pdf_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [pkg.name, pkg.country, pkg.price, pkg.duration, pkg.image, pkg.description, ""]
      );
    }
  }

  const demoOverdueTicket = await get(
    "SELECT id FROM ticket_requests WHERE first_name = ? AND last_name = ?",
    ["Demo", "Overdue"]
  );
  if (!demoOverdueTicket && process.env.SEED_DEMO_OVERDUE_TICKET !== "false") {
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    const travelDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    await run(
      `INSERT INTO ticket_requests
      (first_name, last_name, date_of_birth, travel_date, return_date, from_destination, to_destination, transport_type, people_count, adults_count, children_count, babies_count, notes, mobile_country_code, mobile_number, airplane_luggage, boat_has_car, created_at, is_checked)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "Demo",
        "Overdue",
        "1990-05-15",
        travelDate,
        "",
        "Athens Airport (ATH)",
        "Thessaloniki Airport (SKG)",
        "airplane",
        2,
        2,
        0,
        0,
        "Demo ticket for overdue styling — safe to delete from Admin.",
        "+30",
        "6900000000",
        1,
        null,
        eightDaysAgo,
        0,
      ]
    );
  }
}

async function ping() {
  await pool.query("SELECT 1");
}

module.exports = {
  pool,
  all,
  get,
  run,
  runInsert,
  initDb,
  ping,
};
