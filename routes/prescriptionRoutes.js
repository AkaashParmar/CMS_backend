import express from "express";
import {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  getRecentPrescriptions,
  createPrescriptionTemplate,
  getPrescriptionTemplates,
} from "../controllers/prescriptionController.js";
import authenticate from "../middleware/authmiddleware.js";

const router = express.Router();


router.post("/", authenticate, createPrescriptionTemplate);   //superAdmin
router.get("/", authenticate, getPrescriptionTemplates);
router.post("/create", authenticate, createPrescription);
router.get("/get", authenticate, getPrescriptions);
router.get("/get/:id", authenticate, getPrescriptionById);
router.get("/recent/:patientId", authenticate, getRecentPrescriptions);


export default router;
