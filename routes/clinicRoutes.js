import express from "express";
import {
  createClinic,
  getClinics,
  getClinicById,
  updateClinic,
  deleteClinic,
} from "../controllers/clinicController.js";

const router = express.Router();

router.post("/create", createClinic); // Add clinic
router.get("/allClinics", getClinics); // List all clinics
router.get("/single/:id", getClinicById); // Get single clinic
router.put("/update/:id", updateClinic); // Update clinic
router.delete("/delete/:id", deleteClinic); // Delete clinic

export default router;
