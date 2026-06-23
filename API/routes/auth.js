import express from "express";
import { login, register, logout } from "../controllers/auth.js";

const router = express.Router();

// Simple in-memory rate limiter: max 10 attempts per IP per 15 minutes
const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

const authRateLimit = (req, res, next) => {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  const now = Date.now();
  const record = attempts.get(ip);

  if (!record || now - record.windowStart > WINDOW_MS) {
    attempts.set(ip, { count: 1, windowStart: now });
    return next();
  }

  record.count += 1;
  if (record.count > MAX_ATTEMPTS) {
    return res
      .status(429)
      .json("Too many attempts. Please wait 15 minutes and try again.");
  }
  next();
};

router.post("/login", authRateLimit, login);
router.post("/register", authRateLimit, register);
router.post("/logout", logout);

export default router;