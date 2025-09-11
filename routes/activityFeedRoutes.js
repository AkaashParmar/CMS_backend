import express from "express";
import { getActivityFeed, getMonthlyBillingTrend, getSummaryStats } from "../controllers/activityFeedController.js";
import authenticate from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/", authenticate, getActivityFeed);
router.get("/monthly-billing", authenticate, getMonthlyBillingTrend);
router.get("/summary-stats", authenticate, getSummaryStats);

export default router;
