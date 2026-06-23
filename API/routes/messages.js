import express from "express";
import { getMessages, sendMessage } from "../controllers/message.js";

const router = express.Router();

router.get("/:userId", getMessages);
router.post("/:userId", sendMessage);

export default router;
