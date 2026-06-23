import express from "express";
import { addFeatureItem, getFeatureItems } from "../controllers/feature.js";

const router = express.Router();

router.get("/:type", getFeatureItems);
router.post("/:type", addFeatureItem);

export default router;
