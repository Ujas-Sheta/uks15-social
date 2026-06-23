import "dotenv/config";
import mysql from "mysql2/promise";

const db = await mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "mydevify_social",
});

const [tables] = await db.query("SHOW TABLES");
const tableKey = Object.keys(tables[0])[0];

console.log("\n========================================");
console.log(" DATABASE:", process.env.DB_NAME || "mydevify_social");
console.log("========================================\n");

for (const row of tables) {
  const tableName = row[tableKey];

  const [rows] = await db.query(`SELECT * FROM \`${tableName}\``);
  const [countResult] = await db.query(`SELECT COUNT(*) as total FROM \`${tableName}\``);
  const total = countResult[0].total;

  console.log(`\n──────────────────────────────────────`);
  console.log(` TABLE: ${tableName.toUpperCase()}  (${total} row${total !== 1 ? "s" : ""})`);
  console.log(`──────────────────────────────────────`);

  if (rows.length === 0) {
    console.log("  (empty)");
  } else {
    // Hide password column for users table
    const sanitized = rows.map((r) => {
      const { password, ...rest } = r;
      return rest;
    });
    console.table(sanitized);
  }
}

await db.end();
console.log("\n========================================");
console.log(" Done.");
console.log("========================================\n");
