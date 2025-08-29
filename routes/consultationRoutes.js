import express from "express";
import { createConsultation } from "../controllers/consultationController.js";
import authenticate from "../middleware/authmiddleware.js";

const router = express.Router();

// Only logged-in companyAdmin can create
router.post("/", authenticate, createConsultation);

export default router;
