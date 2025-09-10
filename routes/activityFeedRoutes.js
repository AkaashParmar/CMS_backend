import express from "express";
import { getActivityFeed, getMonthlyBillingTrend, getSummaryStats } from "../controllers/activityFeedController.js";

const router = express.Router();

router.get("/", getActivityFeed);
router.get("/monthly-billing", getMonthlyBillingTrend);
router.get("/summary-stats", getSummaryStats);

export default router;
