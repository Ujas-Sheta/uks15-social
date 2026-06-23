import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import { createNotification } from "./notification.js";

const areConnected = (viewerId, otherId, callback) => {
  const q = `
    SELECT id FROM relationships
    WHERE (followerUserId = ? AND followedUserId = ?)
       OR (followerUserId = ? AND followedUserId = ?)
    LIMIT 1
  `;

  db.query(q, [viewerId, otherId, otherId, viewerId], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows.length > 0);
  });
};

export const getMessages = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, (process.env.JWT_SECRET || "secretkey"), (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
    if (String(userInfo.id) === String(req.params.userId)) {
      return res.status(400).json("You cannot message your own profile.");
    }

    areConnected(userInfo.id, req.params.userId, (connectionErr, connected) => {
      if (connectionErr) return res.status(500).json(connectionErr);
      if (!connected) return res.status(403).json("You can message connections only.");

      const q = `
        SELECT * FROM messages
        WHERE (senderId = ? AND receiverId = ?)
           OR (senderId = ? AND receiverId = ?)
        ORDER BY createdAt ASC
      `;

      db.query(q, [userInfo.id, req.params.userId, req.params.userId, userInfo.id], (dbErr, data) => {
        if (dbErr) return res.status(500).json(dbErr);
        return res.status(200).json(data);
      });
    });
  });
};

export const sendMessage = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, (process.env.JWT_SECRET || "secretkey"), (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
    if (String(userInfo.id) === String(req.params.userId)) {
      return res.status(400).json("You cannot message your own profile.");
    }

    areConnected(userInfo.id, req.params.userId, (connectionErr, connected) => {
      if (connectionErr) return res.status(500).json(connectionErr);
      if (!connected) return res.status(403).json("You can message connections only.");

      const q = "INSERT INTO messages (senderId, receiverId, body) VALUES (?, ?, ?)";

      db.query(q, [userInfo.id, req.params.userId, req.body.body], (dbErr) => {
        if (dbErr) return res.status(500).json(dbErr);
        createNotification({
          receiverId: req.params.userId,
          senderId: userInfo.id,
          type: "message",
          entityId: userInfo.id,
        });
        return res.status(200).json("Message sent.");
      });
    });
  });
};
