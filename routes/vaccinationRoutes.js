import express from "express";
import {
  createDose,
  getDoses,
  getDoseById,
  createStock,
  getStocks,
  getStockById,
  updateStock,
  deleteStock,
} from "../controllers/vaccinationController.js";

const router = express.Router();

// Dose Routes
router.post("/doses", createDose);
router.get("/doses", getDoses);
router.get("/doses/:id", getDoseById);

// Stock Routes
router.post("/stocks", createStock);
router.get("/stocks", getStocks);
router.get("/stocks/:id", getStockById);
router.put("/:id", updateStock); // full update
router.patch("/:id", updateStock); // partial update
router.delete("/:id", deleteStock);

export default router;
