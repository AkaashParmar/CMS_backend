import Bill from "../models/Bill.js";

// 📍 Create Bill
export const createBill = async (req, res) => {
  try {
    const count = await Bill.countDocuments();
    const transactionId = "TRX" + (count + 1).toString().padStart(3, "0");

    const bill = new Bill({
      ...req.body,
      transactionId,
    });

    await bill.save();
    res.status(201).json(bill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 📍 Get All Bills (with filters & search)
export const getBills = async (req, res) => {
  try {
    const { search, pendingOnly, fromDate, toDate, page = 1, limit = 10 } = req.query;

    let query = {};

    if (search) {
      query.item = { $regex: search, $options: "i" };
    }

    if (pendingOnly === "true") {
      query.status = "Pending";
    }

    if (fromDate && toDate) {
      query.date = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }

    const bills = await Bill.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Bill.countDocuments(query);

    res.json({
      bills,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📍 Update Bill
export const updateBill = async (req, res) => {
  try {
    const bill = await Bill.findOneAndUpdate(
      { transactionId: req.params.id },
      req.body,
      { new: true }
    );

    if (!bill) return res.status(404).json({ message: "Bill not found" });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📍 Delete Bill
export const deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findOneAndDelete({ transactionId: req.params.id });

    if (!bill) return res.status(404).json({ message: "Bill not found" });
    res.json({ message: "Bill deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
