import Billing from "../models/Billing.js";

// Create new invoice
export const createInvoice = async (req, res) => {
  try {
    const invoice = new Billing(req.body);
    const saved = await invoice.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all invoices
export const getInvoices = async (req, res) => {
  try {
    const invoices = await Billing.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get invoice by ID
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Billing.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update invoice (edit patient, service, status, etc.)
export const updateInvoice = async (req, res) => {
  try {
    const updated = await Billing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Invoice not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update Payment for an Invoice
export const updateInvoicePayment = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { method, amount, reference } = req.body;

    if (!amount || amount <= 0) {
      return res
        .status(400)
        .json({ message: "Payment amount must be greater than 0" });
    }

    const invoice = await Billing.findOne({ invoiceId });
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    // Recalculate invoice total from items (safety check)
    invoice.amount = invoice.items.reduce(
      (sum, item) => sum + item.qty * item.price,
      0
    );

    // Add payment
    invoice.payments.push({
      method,
      amount,
      reference,
      paidOn: new Date(),
    });

    // Calculate total paid
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);

    // Update status correctly
    if (totalPaid >= invoice.amount) {
      invoice.status = "Paid";
    } else {
      invoice.status = "Unpaid";
    }

    await invoice.save();

    res.json({
      message: "Payment updated successfully",
      invoice,
      totalPaid,
      outstanding: Math.max(invoice.amount - totalPaid, 0), // prevent negatives
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update items (description, qty, price)
export const updateInvoiceItems = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res
        .status(400)
        .json({ message: "Items must be provided as an array" });
    }

    const invoice = await Billing.findOne({ invoiceId });
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Replace items with new ones
    invoice.items = items;

    // Recalculate total amount
    invoice.amount = invoice.items.reduce(
      (sum, item) => sum + item.qty * item.price,
      0
    );

    // If payments already exist, recheck status
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    invoice.status = totalPaid >= invoice.amount ? "Paid" : "Unpaid";

    await invoice.save();

    res.json({
      message: "Invoice items updated successfully",
      invoice,
      totalAmount: invoice.amount,
      totalPaid,
      outstanding: Math.max(invoice.amount - totalPaid, 0),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete invoice
export const deleteInvoice = async (req, res) => {
  try {
    const deleted = await Billing.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Invoice not found" });
    res.json({ message: "Invoice deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Accountant Dashboard Data
export const getAccountantDashboard = async (req, res) => {
  try {
    // Total revenue
    const totalRevenue = await Billing.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Revenue breakdown by service
    const revenueBreakdown = await Billing.aggregate([
      { $group: { _id: "$service", total: { $sum: "$amount" } } },
    ]);

    // Paid vs Unpaid invoices
    const paymentStatus = await Billing.aggregate([
      { $group: { _id: "$status", total: { $sum: "$amount" } } },
    ]);

    // Outstanding dues (unpaid only)
    const outstanding = await Billing.aggregate([
      { $match: { status: "Unpaid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Recent invoices (latest 10)
    const recentInvoices = await Billing.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      revenueBreakdown,
      paymentStatus,
      totalRevenue: totalRevenue[0]?.total || 0,
      outstanding: outstanding[0]?.total || 0,
      recentInvoices,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
