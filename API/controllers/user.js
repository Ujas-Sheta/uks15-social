import { db, dbAsync } from "../connect.js";
import jwt from "jsonwebtoken";

export const getUser = (req, res) => {
  const userId = req.params.userId;

  const q = "SELECT * FROM users WHERE id=?";

  db.query(q, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) {
      return res.status(404).json({ message: "User not found" }); // in case tneket show this
    }
    const { password, ...info } = data[0];
    return res.json(info);
  });
};

export const searchUsers = (req, res) => {
  const searchTerm = req.query.q?.trim();

  if (!searchTerm) return res.status(200).json([]);

  const q = `
    SELECT id, username, name, profilePic
    FROM users
    WHERE username LIKE ? OR name LIKE ?
    ORDER BY username ASC
    LIMIT 8
  `;

  const value = `%${searchTerm}%`;

  db.query(q, [value, value], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};


export const deleteUser = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");

  let userInfo;
  try {
    userInfo = await new Promise((resolve, reject) =>
      jwt.verify(token, process.env.JWT_SECRET || "secretkey", (err, info) =>
        err ? reject(err) : resolve(info)
      )
    );
  } catch {
    return res.status(403).json("Token is not valid!");
  }

  const conn = await dbAsync.getConnection();
  try {
    await conn.beginTransaction();

    // Delete everything belonging to this user, in dependency order
    await conn.query("DELETE FROM notifications WHERE receiverId = ? OR senderId = ?", [userInfo.id, userInfo.id]);
    await conn.query("DELETE FROM messages WHERE senderId = ? OR receiverId = ?", [userInfo.id, userInfo.id]);
    await conn.query("DELETE FROM friend_requests WHERE senderId = ? OR receiverId = ?", [userInfo.id, userInfo.id]);
    await conn.query("DELETE FROM relationships WHERE followerUserId = ? OR followedUserId = ?", [userInfo.id, userInfo.id]);
    await conn.query("DELETE FROM saved_posts WHERE userId = ?", [userInfo.id]);
    await conn.query("DELETE FROM likes WHERE userId = ?", [userInfo.id]);
    await conn.query("DELETE FROM comments WHERE userId = ?", [userInfo.id]);
    await conn.query("DELETE FROM stories WHERE userId = ?", [userInfo.id]);
    await conn.query("DELETE FROM feature_items WHERE userId = ?", [userInfo.id]);
    await conn.query("DELETE FROM posts WHERE userId = ?", [userInfo.id]);
    await conn.query("DELETE FROM users WHERE id = ?", [userInfo.id]);

    await conn.commit();
    conn.release();

    res.clearCookie("accessToken", { httpOnly: true }).status(200).json("Account deleted.");
  } catch (err) {
    await conn.rollback();
    conn.release();
    return res.status(500).json(err);
  }
};

export const updateUser = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, (process.env.JWT_SECRET || "secretkey"), (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q =
      "UPDATE users SET `name`=?,`bio`=?,`website`=?,`profilePic`=?,`coverPic`=?,`isPrivate`=? WHERE id=? ";

    db.query(
      q,
      [
        req.body.name,
        req.body.bio,
        req.body.website,
        req.body.profilePic,
        req.body.coverPic,
        req.body.isPrivate ? 1 : 0,
        userInfo.id,
      ],
      (err, data) => {
        if (err) res.status(500).json(err);
        if (data.affectedRows > 0) return res.json("Updated!");
        return res.status(403).json("You can update only your post!");
      }
    );
  });
};
