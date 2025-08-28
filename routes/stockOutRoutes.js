import express from "express";
import {
  createStockOut,
  getAllStockOuts,
  getStockOutById,
  updateStockOut,
  deleteStockOut,
} from "../controllers/stockOutController.js";
import authenticate from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/", authenticate, createStockOut);
router.get("/", authenticate, getAllStockOuts);
router.get("/:id", authenticate, getStockOutById);
router.put("/:id", authenticate, updateStockOut);
router.delete("/:id", authenticate, deleteStockOut);

export default router;
