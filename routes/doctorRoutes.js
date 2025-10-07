import express from "express";
import { addHolidayForAllDoctors, getAllDoctorsHolidays } from "../controllers/doctorController.js";
import authenticate from "../middleware/authmiddleware.js";

const router = express.Router();

// Add holiday for all doctors under companyAdmin
router.post("/holidays/:companyAdminId", authenticate, addHolidayForAllDoctors);

// Get holidays for all doctors under companyAdmin
router.get("/holidays/:companyAdminId", authenticate, getAllDoctorsHolidays);

export default router;
