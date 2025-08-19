import express from "express";
import {
  createDrug,
  getDrugs,
  getDrugById,
  updateDrug,
  deleteDrug,
} from "../controllers/drugController.js";

const router = express.Router();

router.post("/add", createDrug); // Add drug
router.get("/alldrug", getDrugs); // List all drugs
router.get("/:id", getDrugById); // Get single drug
router.put("/:id", updateDrug); // Update drug
router.delete("/:id", deleteDrug); // Delete drug

export default router;
