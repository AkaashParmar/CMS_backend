import express from "express";
import { createConsultation, getConsultations } from "../controllers/consultationController.js";
import authenticate from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/create", authenticate, createConsultation);
router.get("/get", authenticate, getConsultations);


export default router;
