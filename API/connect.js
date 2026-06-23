import "dotenv/config";
import mysql from "mysql2";

const isCloud = Boolean(process.env.DB_SSL);

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "mydevify_social",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ...(isCloud && { ssl: { rejectUnauthorized: false } }),
});

// Callback-style pool (drop-in for all existing db.query() calls)
export const db = pool;

// Promise-style pool for async/await usage
export const dbAsync = pool.promise();
