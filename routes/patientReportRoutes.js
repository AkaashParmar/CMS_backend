import express from "express";
import {
  uploadReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
  getReportsPerMonth,
  getMyReports,
} from "../controllers/patientReportController.js";
import authenticate from "../middleware/authmiddleware.js";
import authorizeRoles from "../middleware/authorizeRolemiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", authenticate, upload.single("file"), uploadReport);
router.get("/", authenticate, getReports);
router.get("/:id", authenticate, getReportById);
router.put("/:id", authenticate, updateReport);
router.delete("/:id", authenticate, deleteReport);
router.get("/stats/monthly", authenticate, getReportsPerMonth);
router.get("/getreports", authenticate, getMyReports);

export default router;
