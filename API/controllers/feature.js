import { db } from "../connect.js";
import jwt from "jsonwebtoken";

export const getFeatureItems = (req, res) => {
  const q = `
    SELECT fi.*, u.username, u.name, u.profilePic
    FROM feature_items AS fi
    JOIN users AS u ON u.id = fi.userId
    WHERE fi.type = ?
    ORDER BY fi.createdAt DESC
  `;

  db.query(q, [req.params.type], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const addFeatureItem = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, (process.env.JWT_SECRET || "secretkey"), (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = `
      INSERT INTO feature_items
      (type, title, description, media, mediaType, meta, userId)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const mediaType = req.body.mediaType === "video" ? "video" : "image";

    db.query(
      q,
      [
        req.params.type,
        req.body.title,
        req.body.description,
        req.body.media || null,
        mediaType,
        req.body.meta || null,
        userInfo.id,
      ],
      (dbErr) => {
        if (dbErr) return res.status(500).json(dbErr);
        return res.status(200).json("Item created.");
      }
    );
  });
};
