import express from "express";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
} from "../controllers/billingController.js";
import authenticate from "../middleware/authmiddleware.js";
import authorizeRoles from "../middleware/authorizeRolemiddleware.js";

const router = express.Router();

router.post("/newInvoice", createInvoice);
router.get("/listAll", getInvoices);
router.get(
  "/single/:id",
  getInvoiceById,
  authenticate,
  authorizeRoles("patient")
);
router.put("/edit/:id", updateInvoice);
router.delete("/delete/:id", deleteInvoice);

export default router;
