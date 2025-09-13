import express from "express";
import { getActivityFeed, getMonthlyBillingTrend, getSummaryStats, getDashboardActivity } from "../controllers/activityFeedController.js";
import authenticate from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/", authenticate, getActivityFeed);
router.get("/monthly-billing", authenticate, getMonthlyBillingTrend);
router.get("/summary-stats", authenticate, getSummaryStats);
router.get("/recent-activity", authenticate, getDashboardActivity);

export default router;
