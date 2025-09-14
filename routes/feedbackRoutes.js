import express from "express";
import {
  createIssue,
  getIssuesForCompanyAdmin,
  getOwnIssues,
  getIssues,
  getFilteredIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  createFeedback,
  // getAllFeedback,
  // getIssueById,
  resolveFeedback,
} from "../controllers/feedbackController.js";
import authorizeRoles from "../middleware/authorizeRolemiddleware.js";
import authenticate from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/", authenticate, createIssue);
router.get("/getissue", authenticate, getIssuesForCompanyAdmin);
router.get("/getOwn", authenticate, getOwnIssues);
router.get("/", authenticate, getIssues);
router.get("/issue", authenticate, getFilteredIssues);
router.get("/:id", authenticate, getIssueById);
router.put("/:id", authenticate, authorizeRoles("companyAdmin"), updateIssue);
router.delete("/:id", authenticate, deleteIssue);
router.post("/feedback", authenticate, createFeedback);
router.put(
  "/feedback/:id",
  authenticate,
  authorizeRoles("superAdmin"),
  resolveFeedback
);
export default router;
