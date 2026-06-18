import Database from "better-sqlite3";
import path from "path";

const dbPath = path.resolve(process.cwd(), "data", "red-otter.db");
const sqlite = new Database(dbPath);

// Add role column if it doesn't exist
const columns = sqlite.pragma("table_info(users)") as { name: string }[];
const hasRole = columns.some((c) => c.name === "role");

if (!hasRole) {
  sqlite.exec(`ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'`);
  console.log("Added 'role' column to users table.");
} else {
  console.log("'role' column already exists.");
}

sqlite.close();
