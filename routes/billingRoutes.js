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
  getDoctorCommissionData,
} from "../controllers/billingController.js";
import authenticate from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/", authenticate, createBilling);
router.get("/", authenticate, getBills);

router.get("/doctor-commission", getDoctorCommissionData);

//Accountant Dashboard
router.get("/recent", authenticate, getRecentBills);
router.get("/stats", authenticate, getBillingStats);

router.post("/item/:billId", authenticate, addBillingItem);

router.get("/:billId", authenticate, getBillById);
router.put("/:billId/status", authenticate, updateBillStatus);
router.delete("/:billId", authenticate, deleteBill);



export default router;
