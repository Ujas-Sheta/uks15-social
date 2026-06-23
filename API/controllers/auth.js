import { db } from "../connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";
const isProduction = process.env.NODE_ENV === "production" || process.env.CLIENT_URL?.startsWith("https");
const COOKIE_OPTIONS = {
  httpOnly: true,
  ...(isProduction && { sameSite: "none", secure: true }),
};

export const register = (req, res) => {
  const { username, email, password, name } = req.body;

  if (!username || !email || !password || !name) {
    return res.status(400).json("All fields are required.");
  }

  const q = "SELECT * FROM users WHERE username = ? OR email = ?";
  db.query(q, [username, email], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length) return res.status(409).json("Username or email already in use.");

    const hashedPassword = bcrypt.hashSync(password, 10);
    const insertQ = "INSERT INTO users (`username`,`email`,`password`,`name`) VALUE (?)";
    const values = [username, email, hashedPassword, name];

    db.query(insertQ, [values], (err) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("User has been created.");
    });
  });
};

export const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json("Username and password are required.");
  }

  const q = "SELECT * FROM users WHERE username = ?";
  db.query(q, [username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("User not found!");

    const checkPassword = bcrypt.compareSync(password, data[0].password);
    if (!checkPassword) return res.status(400).json("Wrong password or username!");

    const token = jwt.sign({ id: data[0].id }, JWT_SECRET, { expiresIn: "7d" });
    const { password: _pw, ...others } = data[0];

    res
      .cookie("accessToken", token, COOKIE_OPTIONS)
      .status(200)
      .json(others);
  });
};

export const logout = (req, res) => {
  res.clearCookie("accessToken", COOKIE_OPTIONS).status(200).json("User has been logged out.");
};
