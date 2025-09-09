import express from "express";
import {
  createDose,
  getDoses,
  getDoseById,
  getMonthlyVaccinationStats,
  createStock,
  getStocks,
  getStockById,
  updateStock,
  deleteStock,
  getPatientVaccinationSummary,
} from "../controllers/vaccinationController.js";
import authenticate from "../middleware/authmiddleware.js";

const router = express.Router();

// Dose Routes
router.post("/doses", authenticate, createDose);
router.get("/doses", authenticate, getDoses);
router.get("/getSummary/:id", getPatientVaccinationSummary);
router.get("/doses/:id", authenticate, getDoseById);

router.get("/stats/monthly", authenticate, getMonthlyVaccinationStats)

// Stock Routes
router.post("/stocks", authenticate, createStock);
router.get("/stocks", authenticate, getStocks);
router.get("/stocks/:id", authenticate, getStockById);
router.put("/stocks/:id", authenticate, updateStock); // full update
router.patch("/:id", authenticate, updateStock); // partial update
router.delete("/:id", authenticate, deleteStock);

export default router;
