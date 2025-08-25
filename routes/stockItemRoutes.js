import express from "express";
import {
  createStockItem,
  getStockItems,
  getStockItemById,
  updateStockItem,
  deleteStockItem,
} from "../controllers/stockItemController.js";
import authenticate from "../middleware/authmiddleware.js";
import authorizeRoles from "../middleware/authorizeRolemiddleware.js";

const router = express.Router();

router.post(
  "/create",
  authenticate,
  authorizeRoles("companyAdmin"),
  createStockItem
);
router.get("/getAll", getStockItems);
router.get("/get/:id", getStockItemById);
router.put("/update/:id", updateStockItem);
router.delete("/delete/:id", deleteStockItem);

export default router;
