import { db } from "../connect.js";
import jwt from "jsonwebtoken";

const postSelect = `
  SELECT p.id, p.Desc, p.img, p.createdAt, p.userId AS userId, u.username, u.name, u.profilePic, sp.createdAt AS savedAt
  FROM saved_posts AS sp
  JOIN posts AS p ON p.id = sp.postId
  JOIN users AS u ON u.id = p.userId
  WHERE sp.userId = ?
  ORDER BY sp.createdAt DESC
`;

export const getSavedPosts = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, process.env.JWT_SECRET || "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    db.query(postSelect, [userInfo.id], (dbErr, data) => {
      if (dbErr) return res.status(500).json(dbErr);
      return res.status(200).json(data);
    });
  });
};

export const getSavedStatus = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, process.env.JWT_SECRET || "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    db.query(
      "SELECT id FROM saved_posts WHERE userId = ? AND postId = ?",
      [userInfo.id, req.params.postId],
      (dbErr, rows) => {
        if (dbErr) return res.status(500).json(dbErr);
        return res.status(200).json({ saved: rows.length > 0 });
      }
    );
  });
};

export const savePost = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, process.env.JWT_SECRET || "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = `
      INSERT INTO saved_posts (userId, postId)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE createdAt = CURRENT_TIMESTAMP
    `;

    db.query(q, [userInfo.id, req.params.postId], (dbErr) => {
      if (dbErr) return res.status(500).json(dbErr);
      return res.status(200).json("Post saved.");
    });
  });
};

export const unsavePost = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, process.env.JWT_SECRET || "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    db.query(
      "DELETE FROM saved_posts WHERE userId = ? AND postId = ?",
      [userInfo.id, req.params.postId],
      (dbErr) => {
        if (dbErr) return res.status(500).json(dbErr);
        return res.status(200).json("Post removed from saved.");
      }
    );
  });
};
