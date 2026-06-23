import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import { createNotification } from "./notification.js";


export const getLikes = (req,res) =>{

    const q = `SELECT userId AS userId, reactionType from Likes WHERE postId = ?`;


     db.query(q, [req.query.postId], (err, data) => {
       if (err) return res.status(500).json(err);
      return res.status(200).json(data);
     });
    

} 



export const addLike = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, (process.env.JWT_SECRET || "secretkey"), (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const reactionType = req.body.reactionType || "like";
    const deleteQ = "DELETE FROM likes WHERE userId = ? AND postId = ?";
    const insertQ = "INSERT INTO likes (`userId`,`postId`, `reactionType`) VALUES (?)";
    const values = [userInfo.id, req.body.postId, reactionType];

    db.query(deleteQ, [userInfo.id, req.body.postId], (deleteErr) => {
      if (deleteErr) return res.status(500).json(deleteErr);

      db.query(insertQ, [values], (err) => {
        if (err) return res.status(500).json(err);
        db.query(
          "SELECT userId FROM posts WHERE id = ?",
          [req.body.postId],
          (postErr, posts) => {
            if (!postErr && posts.length > 0) {
              createNotification({
                receiverId: posts[0].userId,
                senderId: userInfo.id,
                type: "like",
                entityId: req.body.postId,
              });
            }
          }
        );
        return res.status(200).json("Reaction saved.");
      });
    });
  });
};


export const deleteLike = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, (process.env.JWT_SECRET || "secretkey"), (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q =
      "DELETE FROM likes WHERE `userId` = ? AND `postId` = ?";
    

    db.query(q, [userInfo.id, req.query.postId], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Like has been Deleted.");
    });
  });
};
