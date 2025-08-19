import express from "express";
import {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
} from "../controllers/prescriptionController.js";

const router = express.Router();

router.post("/create", createPrescription);
router.get("/get", getPrescriptions);
router.get("/get/:id", getPrescriptionById);

export default router;
