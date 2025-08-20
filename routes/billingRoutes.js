import express from "express";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
} from "../controllers/billingController.js";

const router = express.Router();

router.post("/newInvoice", createInvoice);
router.get("/listAll", getInvoices);
router.get("/single/:id", getInvoiceById);
router.put("/edit/:id", updateInvoice);
router.delete("/delete/:id", deleteInvoice);

export default router;
