import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/stockCategoryController.js";
import authenticate from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/", authenticate, createCategory);
router.get("/", authenticate, getCategories);
router.get("/:id", authenticate, getCategoryById);
router.put("/:id", authenticate, updateCategory);
router.delete("/:id", authenticate, deleteCategory);

export default router;
