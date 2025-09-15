import express from "express";
import {
  createStockOut,
  getAllStockOuts,
  getStockOutCounts,
  getStockOutById,
  updateStockOut,
  deleteStockOut,
  getStockStatus,
} from "../controllers/stockOutController.js";
import authenticate from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/", authenticate, createStockOut);
router.get("/", authenticate, getAllStockOuts);
router.get("/counts", authenticate, getStockOutCounts);
router.get("/getStockStatus", authenticate, getStockStatus);
router.get("/:id", authenticate, getStockOutById);
router.put("/:id", authenticate, updateStockOut);
router.delete("/:id", authenticate, deleteStockOut);


export default router;
