import express from "express";
import { createConsultation, getConsultations, getConsultationBilling, getBillingSummary, getPaymentSummary, getPatientVisitsByDepartment, getConsultationsByDate } from "../controllers/consultationController.js";
import authenticate from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/create", authenticate, createConsultation);
router.get("/get", authenticate, getConsultations);
router.get("/billing", authenticate, getConsultationBilling);
router.get("/billing/summary", authenticate, getBillingSummary);
router.get("/payment/summary", authenticate, getPaymentSummary);
router.get("/getPatients", authenticate, getPatientVisitsByDepartment);
router.get("/getDate", authenticate, getConsultationsByDate);


export default router;
