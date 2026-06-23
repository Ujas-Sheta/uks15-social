import express from "express";
import { getUser, searchUsers, updateUser, deleteUser } from "../controllers/user.js";

const router = express.Router();

router.get("/search", searchUsers);
router.get("/find/:userId", getUser);
router.put("/", updateUser);
router.delete("/", deleteUser);

export default router;
