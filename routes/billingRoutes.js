import express from "express";
import {
  createBilling,
  getBills,
  getBillById,
  updateBillStatus,
  deleteBill,
  addBillingItem,
  getRecentBills,
  getBillingStats,
} from "../controllers/billingController.js";
import authenticate from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/", authenticate, createBilling);
router.get("/", authenticate, getBills);

//Accountant Dashboard
router.get("/recent", authenticate, getRecentBills);
router.get("/stats", authenticate, getBillingStats);

router.get("/:billId", authenticate, getBillById);
router.put("/:billId/status", authenticate, updateBillStatus);
router.delete("/:billId", authenticate, deleteBill);

router.post("/item/:billId", authenticate, addBillingItem);

export default router;
