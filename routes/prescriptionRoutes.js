import express from "express";
import {
  createPrescription,
  getPrescriptions,
  getPrescriptionsByPatientId,
  getRecentPrescriptions,
  createPrescriptionTemplate,
  getPrescriptionTemplates,
} from "../controllers/prescriptionController.js";
import authenticate from "../middleware/authmiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();


router.post("/", authenticate, createPrescriptionTemplate);   //superAdmin
router.get("/", authenticate, getPrescriptionTemplates);
router.post("/create", upload.single("photo"), authenticate, createPrescription);
router.get("/get", authenticate, getPrescriptions);
router.get("/patient/:patientId", authenticate, getPrescriptionsByPatientId);
router.get("/recent/:patientId", authenticate, getRecentPrescriptions);


export default router;
