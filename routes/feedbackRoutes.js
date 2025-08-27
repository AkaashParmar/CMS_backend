import express from "express";
import {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
} from "../controllers/feedbackController.js";
import authorizeRoles from "../middleware/authorizeRolemiddleware.js";
import authenticate from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/", authenticate, createIssue);
router.get("/", authenticate, getIssues);
router.get("/:id", authenticate, getIssueById);
router.put("/:id", authenticate, authorizeRoles("companyAdmin"), updateIssue);
router.delete("/:id", authenticate, deleteIssue);

export default router;
