import express from "express";
import {
  getSavedPosts,
  getSavedStatus,
  savePost,
  unsavePost,
} from "../controllers/saved.js";

const router = express.Router();

router.get("/", getSavedPosts);
router.get("/:postId", getSavedStatus);
router.post("/:postId", savePost);
router.delete("/:postId", unsavePost);

export default router;
