import express from "express";
import { getActivityFeed, getMonthlyBillingTrend } from "../controllers/activityFeedController.js";

const router = express.Router();

router.get("/", getActivityFeed);
router.get("/monthly-billing", getMonthlyBillingTrend);

export default router;
