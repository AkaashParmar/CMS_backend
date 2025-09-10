import express from "express";
import {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
} from "../controllers/prescriptionController.js";
import authenticate from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/create", authenticate, createPrescription);
router.get("/get", authenticate, getPrescriptions);
router.get("/get/:id", authenticate, getPrescriptionById);

export default router;
