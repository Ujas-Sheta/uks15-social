import { db, dbAsync } from "../connect.js";
import jwt from "jsonwebtoken";
import { createNotification } from "./notification.js";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

const verifyToken = (token) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, JWT_SECRET, (err, info) => (err ? reject(err) : resolve(info)))
  );

// ─── Simple callback-style helpers (unchanged behaviour) ─────────────────────

export const getRelationships = (req, res) => {
  const q = "SELECT followerUserId FROM relationships WHERE followedUserId = ?";
  db.query(q, [req.query.followedUserId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data.map((r) => r.followerUserId));
  });
};

export const getFollowing = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, JWT_SECRET, (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = `
      SELECT u.id, u.username, u.name, u.profilePic
      FROM relationships AS r
      JOIN users AS u ON u.id = r.followedUserId
      WHERE r.followerUserId = ?
      ORDER BY u.username ASC
    `;
    db.query(q, [userInfo.id], (dbErr, data) => {
      if (dbErr) return res.status(500).json(dbErr);
      return res.status(200).json(data);
    });
  });
};

export const getFollowerDetails = (req, res) => {
  const q = `
    SELECT u.id, u.username, u.name, u.profilePic
    FROM relationships AS r
    JOIN users AS u ON u.id = r.followerUserId
    WHERE r.followedUserId = ?
    ORDER BY u.username ASC
  `;
  db.query(q, [req.query.userId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const getPendingRequests = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, JWT_SECRET, (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = `
      SELECT fr.id, fr.senderId, fr.createdAt, u.username, u.name, u.profilePic
      FROM friend_requests AS fr
      JOIN users AS u ON u.id = fr.senderId
      WHERE fr.receiverId = ? AND fr.status = 'pending'
      ORDER BY fr.createdAt DESC
    `;
    db.query(q, [userInfo.id], (dbErr, data) => {
      if (dbErr) return res.status(500).json(dbErr);
      return res.status(200).json(data);
    });
  });
};

export const getOutgoingRequests = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, JWT_SECRET, (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "SELECT receiverId FROM friend_requests WHERE senderId = ? AND status = 'pending'";
    db.query(q, [userInfo.id], (dbErr, data) => {
      if (dbErr) return res.status(500).json(dbErr);
      return res.status(200).json(data.map((row) => row.receiverId));
    });
  });
};

// ─── Refactored: async/await ──────────────────────────────────────────────────

export const addRelationship = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  let userInfo;
  try {
    userInfo = await verifyToken(token);
  } catch {
    return res.status(403).json("Token is not valid!");
  }

  if (String(userInfo.id) === String(req.body.userId)) {
    return res.status(400).json("You cannot follow your own profile.");
  }

  try {
    // Ensure session user still exists
    const [sessionUsers] = await dbAsync.query("SELECT id FROM users WHERE id = ?", [userInfo.id]);
    if (sessionUsers.length === 0) {
      return res.status(401).json("Session user no longer exists. Please log in again.");
    }

    // Already following?
    const [existing] = await dbAsync.query(
      "SELECT id FROM relationships WHERE followerUserId = ? AND followedUserId = ?",
      [userInfo.id, req.body.userId]
    );
    if (existing.length) return res.status(200).json("Already following");

    // Get target user
    const [users] = await dbAsync.query("SELECT isPrivate FROM users WHERE id = ?", [req.body.userId]);
    if (users.length === 0) return res.status(404).json("User not found");

    if (users[0].isPrivate) {
      // Check for pending request
      const [pending] = await dbAsync.query(
        "SELECT id FROM friend_requests WHERE senderId = ? AND receiverId = ? AND status = 'pending' LIMIT 1",
        [userInfo.id, req.body.userId]
      );
      if (pending.length) return res.status(200).json("Request already sent");

      await dbAsync.query(
        "INSERT INTO friend_requests (senderId, receiverId, status) VALUES (?, ?, 'pending')",
        [userInfo.id, req.body.userId]
      );
      createNotification({ receiverId: req.body.userId, senderId: userInfo.id, type: "follow_request", entityId: userInfo.id });
      return res.status(200).json("Request sent");
    }

    // Public account — follow directly
    await dbAsync.query(
      "INSERT INTO relationships (followerUserId, followedUserId) VALUES (?, ?)",
      [userInfo.id, req.body.userId]
    );
    createNotification({ receiverId: req.body.userId, senderId: userInfo.id, type: "follow", entityId: userInfo.id });
    return res.status(200).json("Following");
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const acceptRequest = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  let userInfo;
  try {
    userInfo = await verifyToken(token);
  } catch {
    return res.status(403).json("Token is not valid!");
  }

  const conn = await dbAsync.getConnection();
  try {
    await conn.beginTransaction();

    const [requests] = await conn.query(
      "SELECT * FROM friend_requests WHERE id = ? AND receiverId = ? AND status = 'pending'",
      [req.params.id, userInfo.id]
    );
    if (requests.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json("Request not found");
    }

    const request = requests[0];
    const insertRel = `
      INSERT INTO relationships (followerUserId, followedUserId)
      SELECT ?, ? WHERE NOT EXISTS (
        SELECT 1 FROM relationships WHERE followerUserId = ? AND followedUserId = ?
      )
    `;

    // sender follows receiver
    await conn.query(insertRel, [request.senderId, userInfo.id, request.senderId, userInfo.id]);
    // receiver follows sender (mutual)
    await conn.query(insertRel, [userInfo.id, request.senderId, userInfo.id, request.senderId]);

    // Clean up any duplicate pending requests between these two users
    await conn.query(
      "DELETE FROM friend_requests WHERE senderId = ? AND receiverId = ? AND id <> ?",
      [request.senderId, userInfo.id, req.params.id]
    );

    await conn.query(
      "UPDATE friend_requests SET status = 'accepted' WHERE id = ?",
      [req.params.id]
    );

    await conn.commit();
    conn.release();

    createNotification({ receiverId: request.senderId, senderId: userInfo.id, type: "request_accepted", entityId: userInfo.id });
    return res.status(200).json("Request accepted");
  } catch (err) {
    await conn.rollback();
    conn.release();
    return res.status(500).json(err);
  }
};

export const rejectRequest = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, JWT_SECRET, (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "UPDATE friend_requests SET status = 'rejected' WHERE id = ? AND receiverId = ?";
    db.query(q, [req.params.id, userInfo.id], (dbErr) => {
      if (dbErr) return res.status(500).json(dbErr);
      return res.status(200).json("Request rejected");
    });
  });
};

export const deleteRelationship = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, JWT_SECRET, (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "DELETE FROM relationships WHERE followerUserId = ? AND followedUserId = ?";
    db.query(q, [userInfo.id, req.query.userId], (err) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Unfollow");
    });
  });
};
