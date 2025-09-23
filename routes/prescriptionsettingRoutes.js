import express from "express";
import { savePrescriptionSettings, getPrescriptionSettings , createPrescriptionSetting } from "../controllers/prescriptionSettingController.js";

const router = express.Router();

// POST: Save or Update settings
router.post("/settings", savePrescriptionSettings);
router.post("/setting", createPrescriptionSetting);
// GET: Fetch settings for company
router.get("/settings/:companyId", getPrescriptionSettings);


export default router;
