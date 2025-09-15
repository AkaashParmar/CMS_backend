import express from "express";
import {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  getRecentPrescriptions,
} from "../controllers/prescriptionController.js";
import authenticate from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/create", authenticate, createPrescription);
router.get("/get", authenticate, getPrescriptions);
router.get("/get/:id", authenticate, getPrescriptionById);
router.get("/recent/:patientId", authenticate, getRecentPrescriptions);

export default router;
