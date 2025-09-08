import express from "express";
import {
  createLabTest,
  getLabTests,
  getLabTestById,
  countLabTests,
  updateLabTest,
  deleteLabTest,
} from "../controllers/labTestController.js";
import authenticate from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/add", authenticate, createLabTest);
router.get("/getAll", authenticate, getLabTests);
router.get("/single/:id", authenticate, getLabTestById);
router.get("/count", countLabTests);
router.put("/update/:id", authenticate, updateLabTest);
router.delete("/delete/:id", authenticate, deleteLabTest);

export default router;
