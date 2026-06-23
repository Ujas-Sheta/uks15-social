import { db } from "../connect.js";
import jwt from "jsonwebtoken";

const buildNotificationMessage = (type, actorName) => {
  if (type === "follow_request") return `${actorName} requested to follow you.`;
  if (type === "request_accepted") return `${actorName} accepted your request.`;
  if (type === "follow") return `${actorName} started following you.`;
  if (type === "like") return `${actorName} reacted to your post.`;
  if (type === "comment") return `${actorName} commented on your post.`;
  if (type === "message") return `${actorName} sent you a message.`;
  return `${actorName} sent you an update.`;
};

export const createNotification = ({
  receiverId,
  senderId,
  type,
  entityId = null,
}) => {
  if (!receiverId || !senderId || Number(receiverId) === Number(senderId)) {
    return;
  }

  const actorQuery = "SELECT username, name FROM users WHERE id = ?";

  db.query(actorQuery, [senderId], (actorErr, users) => {
    if (actorErr || users.length === 0) return;

    const actorName = users[0].name || users[0].username;
    const message = buildNotificationMessage(type, actorName);
    const q = `
      INSERT INTO notifications
      (receiverId, senderId, type, entityId, message)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(q, [receiverId, senderId, type, entityId, message], () => {});
  });
};

export const getNotifications = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, (process.env.JWT_SECRET || "secretkey"), (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = `
      SELECT n.*, u.username, u.name, u.profilePic
      FROM notifications AS n
      JOIN users AS u ON u.id = n.senderId
      WHERE n.receiverId = ?
      ORDER BY n.createdAt DESC
      LIMIT 20
    `;

    db.query(q, [userInfo.id], (dbErr, data) => {
      if (dbErr) return res.status(500).json(dbErr);
      return res.status(200).json(data);
    });
  });
};

export const markNotificationRead = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, (process.env.JWT_SECRET || "secretkey"), (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q =
      "UPDATE notifications SET isRead = 1 WHERE id = ? AND receiverId = ?";

    db.query(q, [req.params.id, userInfo.id], (dbErr) => {
      if (dbErr) return res.status(500).json(dbErr);
      return res.status(200).json("Notification marked as read.");
    });
  });
};

export const markAllNotificationsRead = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, (process.env.JWT_SECRET || "secretkey"), (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "UPDATE notifications SET isRead = 1 WHERE receiverId = ?";

    db.query(q, [userInfo.id], (dbErr) => {
      if (dbErr) return res.status(500).json(dbErr);
      return res.status(200).json("Notifications marked as read.");
    });
  });
};
