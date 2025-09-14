import express from "express";
import { createBill, getBills, updateBill, deleteBill } from "../controllers/billController.js";

const router = express.Router();

router.post("/", createBill);
router.get("/", getBills);
router.put("/:id", updateBill);
router.delete("/:id", deleteBill);

export default router;
