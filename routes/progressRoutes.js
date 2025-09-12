import express from 'express';
import { getPatientProgress, getMonthlyRecoveryProgress, getActivityBreakdown } from '../controllers/progressController.js';
import authenticate from "../middleware/authmiddleware.js";

const router = express.Router();

router.get('/', authenticate, getPatientProgress);
router.get('/monthly-recovery', authenticate, getMonthlyRecoveryProgress);
router.get('/activity-breakdown', authenticate, getActivityBreakdown);


export default router;
