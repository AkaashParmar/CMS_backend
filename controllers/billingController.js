import Billing from "../models/Billing.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Reuse your generateBillId function
const generateBillId = async () => {
  const lastBill = await Billing.findOne().sort({ createdAt: -1 });
  if (!lastBill) return "BILL-0001";

  const lastId = parseInt(lastBill.billId.split("-")[1]);
  const newId = lastId + 1;
  return `BILL-${newId.toString().padStart(4, "0")}`;
};

export const createBilling = async (req, res) => {
  try {
    const { patientId, service, doctor, treatment, items, method } = req.body;

    const newBillId = await generateBillId();

    const processedItems = (items || []).map((item) => ({
      ...item,
      createdAt: new Date(),
    }));

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
      method,
      amount: totalDueBalance,
      items: processedItems,
      dueBalance: totalDueBalance,
      createdBy: req.user.id,
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

// Get bill by billId field
export const getBillById = async (req, res) => {
  try {
    const { billId } = req.params;

    console.log("Looking for bill with billId:", billId);

    const bill = await Billing.findOne({ billId })
      .populate("patientId")
      .populate("doctor", "name email profile.phoneNumber");

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    res.json(bill);
  } catch (err) {
    console.error("❌ Error in getBillById:", err);
    res.status(500).json({ message: "Server error", error: err.message });
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
      createdBy: req.user.id,
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

    const recentBills = await Billing.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("patientId", "name")
      .select("billId amount dueBalance status createdAt");

    if (!recentBills || recentBills.length === 0) {
      return res.status(404).json({ msg: "No bills found" });
    }

    const formatted = recentBills.map((bill) => ({
      billId: bill.billId,
      patient: bill.patientId?.name || "Unknown",
      amount: bill.amount,
      dueBalance: bill.dueBalance || 0,
      status: bill.status || "Pending",
      createdAt: bill.createdAt,
    }));

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

// API to calculate revenue & total due
export const getBillingStats = async (req, res) => {
  try {
    const revenueResult = await Billing.aggregate([
      { $match: { status: "Paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
    ]);

    const dueResult = await Billing.aggregate([
      { $group: { _id: null, totalDueBalance: { $sum: "$dueBalance" } } },
    ]);

    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    const totalDueBalance =
      dueResult.length > 0 ? dueResult[0].totalDueBalance : 0;

    res.json({
      msg: "Billing stats fetched successfully",
      totalRevenue,
      totalDueBalance,
    });
  } catch (err) {
    console.error("Error fetching billing stats:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};



// Include the getMonthName function here or import from helper
const getMonthName = (monthIndex) => {
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return names[monthIndex] || "Unknown";
};

export const getDoctorCommissionData = async (req, res) => {
  try {
    let { doctor } = req.query;

    if (!doctor) {
      doctor = "All Doctors Combined";
    }

    // Fetch all doctors and map by name
    const doctors = await User.find({ role: "doctor" });
    const doctorMap = {};
    doctors.forEach((doc) => {
      doctorMap[doc.name] = doc._id;
    });

    let matchStage = {};
    if (doctor !== "All Doctors Combined") {
      const doctorId = doctorMap[doctor];
      if (!doctorId) {
        return res.status(404).json({ msg: `Doctor '${doctor}' not found` });
      }
      matchStage.doctor = doctorId;
    }

    const billingStats = await Billing.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            doctor: "$doctor",
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalRevenue: { $sum: "$amount" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.doctor",
          foreignField: "_id",
          as: "doctorInfo",
        },
      },
      { $unwind: "$doctorInfo" },
      {
        $addFields: {
          doctorName: "$doctorInfo.name",
          doctorShare: { $multiply: ["$totalRevenue", 0.7] },
          clinicCommission: { $multiply: ["$totalRevenue", 0.3] },
          monthNum: "$_id.month",
          year: "$_id.year",
        },
      },
      {
        $project: {
          _id: 0,
          doctorName: 1,
          monthNum: 1,
          year: 1,
          doctorShare: 1,
          clinicCommission: 1,
          totalRevenue: 1,
        },
      },
    ]);

    // Convert month numbers to names
    billingStats.forEach((entry) => {
      entry.month = getMonthName(entry.monthNum - 1);
      delete entry.monthNum;
    });

    // --- Commission breakdown data
    const commissionData = {};
    billingStats.forEach((entry) => {
      const { doctorName, month, doctorShare, clinicCommission } = entry;
      if (!commissionData[doctorName]) {
        commissionData[doctorName] = [];
      }
      commissionData[doctorName].push({ month, doctorShare, clinicCommission });
    });

    // --- Revenue bar chart data
    const doctorRevenue = Object.keys(commissionData).map((doctor) => {
      const total = commissionData[doctor].reduce(
        (sum, item) => sum + item.doctorShare + item.clinicCommission,
        0
      );
      return { doctor, revenue: Math.round(total) };
    });

    // --- Efficiency (mocked based on revenue threshold)
    const efficiencyMap = {
      Efficient: 0,
      Average: 0,
      Underperforming: 0,
    };

    doctorRevenue.forEach((doc) => {
      if (doc.revenue >= 35000) efficiencyMap.Efficient++;
      else if (doc.revenue <= 20000) efficiencyMap.Underperforming++;
      else efficiencyMap.Average++;
    });

    const doctorEfficiency = Object.entries(efficiencyMap).map(
      ([name, value]) => ({ name, value })
    );

    res.status(200).json({
      msg: `Doctor report for ${doctor}`,
      doctorRevenue,
      doctorEfficiency,
      commissionData,
    });
  } catch (err) {
    console.error("❌ Error in getDoctorCommissionData:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export const revenuePerMonth = async (req, res) => {
  try {
    const result = await Billing.aggregate([
      { $match: { status: "Paid" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },  // Fixed field name
          monthlyRevenue: { $sum: "$amount" },
        },
      },
      { $sort: { "_id": 1 } },  // Sort by ascending month
    ]);

    res.status(200).json({
      msg: "Monthly revenue data fetched successfully",
      revenuePerMonth: result,
    });
  } catch (err) {
    console.error("❌ Error in revenuePerMonth:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};


export const getAllBills = async (req, res) => {
  try {
    const bill = await Billing.findOne({ billId: req.params.billId }).populate("patientId", "name");
    if (!bill) return res.status(404).json({ msg: "Bill not found" });


    const formattedBills = bills.map((bill) => ({
      billId: bill.billId,
      patientName: bill.patientId?.name || "Unknown",
      paymentMode: bill.service,
      amount: bill.amount,
      date: bill.date.toISOString().split("T")[0],
      status: bill.status,
    }));

    res.status(200).json({
      msg: "Bills fetched successfully",
      bills: formattedBills,
    });
  } catch (err) {
    console.error("Error fetching bills:", err);
    res.status(500).json({
      msg: "Error fetching bills",
      error: err.message,
    });
  }
};





