import Billing from "../models/Billing.js";

// generate billId
const generateBillId = async () => {
  const lastBill = await Billing.findOne().sort({ createdAt: -1 });
  if (!lastBill) return "BILL-0001";

  const lastId = parseInt(lastBill.billId.split("-")[1]);
  const newId = lastId + 1;
  return `BILL-${newId.toString().padStart(4, "0")}`;
};

// Create billing
export const createBilling = async (req, res) => {
  try {
    const { patientId, patient, service, doctor, treatment, amount, items } =
      req.body;

    const newBillId = await generateBillId();

    const billing = new Billing({
      billId: newBillId,
      patientId,
      patient,
      service,
      doctor,
      treatment,
      amount,
      items,
    });

    const saved = await billing.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all bills
export const getBills = async (req, res) => {
  try {
    const bills = await Billing.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single bill by ID
export const getBillById = async (req, res) => {
  try {
    const bill = await Billing.findOne({ billId: req.params.billId });
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Update bill status (Paid/Unpaid)
export const updateBillStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const bill = await Billing.findOneAndUpdate(
      { billId: req.params.billId },
      { status },
      { new: true }
    );
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    res.json(bill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete bill
export const deleteBill = async (req, res) => {
  try {
    const bill = await Billing.findOneAndDelete({ billId: req.params.billId });
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    res.json({ message: "Bill deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Patient Billing
export const addBillingItem = async (req, res) => {
  try {
    const { billId } = req.params;
    const { service, description, qty, price } = req.body;

    // Find the billing record
    const billing = await Billing.findOne({ billId });
    if (!billing) {
      return res.status(404).json({ msg: "Billing record not found" });
    }

    // Create new item
    const newItem = {
      service,
      description,
      qty,
      price,
      createdAt: new Date(),
    };

    // Push item into billing
    billing.items.push(newItem);

    await billing.save();

    res.json({
      msg: "Item added successfully",
      billing,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
