import express from "express";
import {
  createLabTest,
  getLabTests,
  getLabTestById,
  updateLabTest,
  deleteLabTest,
} from "../controllers/labTestController.js";

const router = express.Router();

router.post("/add", createLabTest);
router.get("/getAll", getLabTests);
router.get("/single/:id", getLabTestById);
router.put("/update/:id", updateLabTest);
router.delete("/delete/:id", deleteLabTest);

export default router;
