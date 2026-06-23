import express from "express";
import {getPosts, addPost,deletePost, repostPost  } from "../controllers/post.js";

const router=express.Router();

router.get("/",getPosts);
router.post("/",addPost);
router.post("/:id/repost",repostPost);
router.delete("/:id",deletePost);

export default router;
