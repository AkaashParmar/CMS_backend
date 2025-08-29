import Billing from "../models/Billing.js";

// generate billId
const generateBillId = async () => {
  const lastBill = await Billing.findOne().sort({ createdAt: -1 });
  if (!lastBill) return "BILL-0001";

  const lastId = parseInt(lastBill.billId.split("-")[1]);
  const newId = lastId + 1;
  return `BILL-${newId.toString().padStart(4, "0")}`;
};

// Create Account billing (Accountant)
export const createBilling = async (req, res) => {
  try {
    const { patientId, service, doctor, treatment, items } = req.body;

    const newBillId = await generateBillId();

    // Process items
    const processedItems = (items || []).map((item) => ({
      ...item,
      createdAt: new Date(),
    }));

    // Calculate total dueBalance (sum of item prices)
    const totalDueBalance = processedItems.reduce(
      (sum, item) => sum + item.price,
      0
    );

    const billing = new Billing({
      billId: newBillId,
      patientId,
      service,
      doctor,
      treatment,
      amount: totalDueBalance,
      items: processedItems,
      dueBalance: totalDueBalance,
    });

    const saved = await billing.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all bills with patient details (Account + Patient Bill)
export const getBills = async (req, res) => {
  try {
    const bills = await Billing.find()
      .sort({ createdAt: -1 })
      .populate("patientId")
      .populate("doctor", "name email profile.phoneNumber");

    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get bill by billId
export const getBillById = async (req, res) => {
  try {
    const bill = await Billing.findOne({ billId: req.params.billId })
      .populate("patientId")
      .populate("doctor", "name email profile.phoneNumber");

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

// Add Patient billing item (Accountant)
export const addBillingItem = async (req, res) => {
  try {
    const { billId } = req.params;
    const { service, description, price } = req.body;

    const billing = await Billing.findOne({ billId });
    if (!billing) {
      return res.status(404).json({ msg: "Billing record not found" });
    }

    const newItem = {
      service,
      description,
      price,
      createdAt: new Date(),
    };

    // Push new item
    billing.items.push(newItem);

    // Recalculate total dueBalance
    billing.dueBalance = billing.items.reduce(
      (sum, item) => sum + item.price,
      0
    );
    billing.amount = billing.dueBalance;

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

//Accountant Dashboard
export const getRecentBills = async (req, res) => {
  try {
    // Fetch recent bills
    const recentBills = await Billing.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("patientId", "name")
      .select("billId amount dueBalance status createdAt");

    if (!recentBills || recentBills.length === 0) {
      return res.status(404).json({ msg: "No bills found" });
    }

    // Format response
    const formatted = recentBills.map((bill) => ({
      billId: bill.billId,
      patient: bill.patientId?.name || "Unknown",
      amount: bill.amount,
      dueBalance: bill.dueBalance || 0,
      status: bill.status || "Pending",
      createdAt: bill.createdAt,
    }));

    // Get counts of Paid / Unpaid
    const paidCount = await Billing.countDocuments({ status: "Paid" });
    const unpaidCount = await Billing.countDocuments({ status: "Unpaid" });

    res.json({
      msg: "Recent bills fetched successfully",
      bills: formatted,
      summary: {
        totalPaid: paidCount,
        totalUnpaid: unpaidCount,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};


