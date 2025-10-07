import express from "express";
import { saveDoctorSurvey, getDoctorPerformance } from "../controllers/doctorPerformanceController.js";

const router = express.Router();

router.post("/survey", saveDoctorSurvey); // save survey responses
router.get("/scores", getDoctorPerformance); // get average scores

export default router;
