import express from "express";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  updateInvoicePayment,
  updateInvoiceItems,
  deleteInvoice,
  getAccountantDashboard,
} from "../controllers/billingController.js";
import authenticate from "../middleware/authmiddleware.js";
import authorizeRoles from "../middleware/authorizeRolemiddleware.js";

const router = express.Router();

router.post(
  "/newInvoice",
  createInvoice,
  authenticate,
  authorizeRoles("accountant")
);

router.get("/listAll", getInvoices, authenticate, authorizeRoles("accountant"));

router.get(
  "/single/:id",
  getInvoiceById,
  authenticate,
  authorizeRoles("patient")
);

router.put(
  "/edit/:id",
  updateInvoice,
  authenticate,
  authorizeRoles("accountant")
);

router.put(
  "/invoices/:invoiceId/items",
  updateInvoiceItems,
  authenticate,
  authorizeRoles("accountant")
);

router.put(
  "/invoices/:invoiceId/payment",
  updateInvoicePayment,
  authenticate,
  authorizeRoles("accountant")
);

router.delete("/delete/:id", deleteInvoice);

router.get(
  "/accountantDash",
  getAccountantDashboard,
  authenticate,
  authorizeRoles("accountant")
);

export default router;
