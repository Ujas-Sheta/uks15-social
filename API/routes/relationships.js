import express from "express";
import {
  addRelationship,
  acceptRequest,
  deleteRelationship,
  getFollowerDetails,
  getFollowing,
  getOutgoingRequests,
  getPendingRequests,
  getRelationships,
  rejectRequest,
} from "../controllers/relationship.js";

const router=express.Router();

router.get("/following", getFollowing)
router.get("/followers", getFollowerDetails)
router.get("/requests", getPendingRequests)
router.get("/requests/outgoing", getOutgoingRequests)
router.post("/requests/:id/accept", acceptRequest)
router.post("/requests/:id/reject", rejectRequest)
router.get("/",getRelationships)
router.post("/",addRelationship)
router.delete("/",deleteRelationship)

export default router;
