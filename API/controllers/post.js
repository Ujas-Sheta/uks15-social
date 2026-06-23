import moment from "moment/moment.js";
import { db } from "../connect.js";
import jwt from "jsonwebtoken";

const PAGE_SIZE = 20;

export const getPosts = (req, res) => {
  const userId = req.query.userId;
  const page = Math.max(0, parseInt(req.query.page) || 0);
  const offset = page * PAGE_SIZE;
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, (process.env.JWT_SECRET || "secretkey"), (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const isProfilePage = userId && userId !== "undefined";

    if (isProfilePage) {
      const privacyQ = "SELECT isPrivate FROM users WHERE id = ?";

      db.query(privacyQ, [userId], (privacyErr, users) => {
        if (privacyErr) return res.status(500).json(privacyErr);
        if (users.length === 0) return res.status(404).json("User not found");

        const isOwner = Number(userId) === Number(userInfo.id);
        const isPrivate = Boolean(users[0].isPrivate);

        if (!isPrivate || isOwner) {
          const q = `SELECT p.id, p.Desc, p.img, p.createdAt, p.userId, u.username, u.name, u.profilePic
             FROM posts AS p
             JOIN users AS u ON u.id = p.userid
             WHERE p.userid = ?
             ORDER BY p.createdAt DESC
             LIMIT ? OFFSET ?`;

          db.query(q, [userId, PAGE_SIZE, offset], (err, data) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json(data);
          });
          return;
        }

        const relationshipQ = "SELECT id FROM relationships WHERE followerUserId = ? AND followedUserId = ?";

        db.query(relationshipQ, [userInfo.id, userId], (relErr, rows) => {
          if (relErr) return res.status(500).json(relErr);
          if (rows.length === 0) return res.status(200).json([]);

          const q = `SELECT p.id, p.Desc, p.img, p.createdAt, p.userId, u.username, u.name, u.profilePic
             FROM posts AS p
             JOIN users AS u ON u.id = p.userid
             WHERE p.userid = ?
             ORDER BY p.createdAt DESC
             LIMIT ? OFFSET ?`;

          db.query(q, [userId, PAGE_SIZE, offset], (err, data) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json(data);
          });
        });
      });
      return;
    }

    // Home feed: own posts + followed users' posts + all public accounts' posts
    const homeFeedQ = `
      SELECT DISTINCT p.id, p.Desc, p.img, p.createdAt, p.userId, u.username, u.name, u.profilePic
      FROM posts AS p
      JOIN users AS u ON u.id = p.userid
      LEFT JOIN relationships AS r ON p.userid = r.followeduserid AND r.followeruserid = ?
      WHERE r.followeruserid = ? OR p.userid = ? OR u.isPrivate = 0
      ORDER BY p.createdAt DESC
      LIMIT ? OFFSET ?
    `;

    db.query(homeFeedQ, [userInfo.id, userInfo.id, userInfo.id, PAGE_SIZE, offset], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
};

export const addPost = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, (process.env.JWT_SECRET || "secretkey"), (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q =
      "INSERT INTO posts(`desc`, `img`, `createdAt`, `userId`) VALUES (?)";
    const values = [
      req.body.desc,
      req.body.img,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      userInfo.id,
    ];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Post has been created.");
    });
  });
};

export const deletePost = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, (process.env.JWT_SECRET || "secretkey"), (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "DELETE FROM posts WHERE `id`=? AND `userId` = ?";

    db.query(q, [req.params.id, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.affectedRows > 0) return res.status(200).json("Post has been deleted.");
      return res.status(403).json("You can delete only your post");
    });
  });
};

export const repostPost = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, (process.env.JWT_SECRET || "secretkey"), (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const sourceQ = `
      SELECT p.Desc, p.img, u.username, u.name
      FROM posts AS p
      JOIN users AS u ON u.id = p.userId
      WHERE p.id = ?
    `;

    db.query(sourceQ, [req.params.id], (sourceErr, posts) => {
      if (sourceErr) return res.status(500).json(sourceErr);
      if (posts.length === 0) return res.status(404).json("Post not found");

      const source = posts[0];
      const author = source.name || source.username;
      const desc = `Reposted from ${author}\n\n${source.Desc || ""}`;
      const q =
        "INSERT INTO posts(`desc`, `img`, `createdAt`, `userId`) VALUES (?)";
      const values = [
        desc,
        source.img,
        moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
        userInfo.id,
      ];

      db.query(q, [values], (insertErr) => {
        if (insertErr) return res.status(500).json(insertErr);
        return res.status(200).json("Post reposted.");
      });
    });
  });
};
