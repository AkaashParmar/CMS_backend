import Billing from "../models/Billing.js";
import StockOut from "../models/StockOut.js";
import Clinic from "../models/Clinic.js";
import LabTest from "../models/LabResult.js";
import Drug from "../models/Drug.js";
import Prescription from "../models/PrescriptionTemplate.js";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";

export const getActivityFeed = async (req, res) => {
    try {
        const feed = [];

        // Billing updates
        const recentBills = await Billing.find().sort({ createdAt: -1 }).limit(5);
        recentBills.forEach((bill) => {
            if (bill.status === "Paid") {
                feed.push({
                    type: "success",
                    message: `Payment of ₹${bill.amount} received for patient "${bill.patientId}"`,
                    date: bill.createdAt,
                });
            } else {
                feed.push({
                    type: "warning",
                    message: `Payment pending of ₹${bill.dueBalance} for patient "${bill.patientId}"`,
                    date: bill.createdAt,
                });
            }
        });

        // StockOut / Inventory updates
        const recentStockOuts = await StockOut.find().sort({ createdAt: -1 }).limit(5);
        recentStockOuts.forEach((stock) => {
            if (stock.quantityAfter < 10) {
                feed.push({
                    type: "warning",
                    message: `Low stock on "${stock.stockItem}"`,
                    date: stock.createdAt,
                });
            } else {
                feed.push({
                    type: "success",
                    message: `Inventory updated for "${stock.stockItem}"`,
                    date: stock.createdAt,
                });
            }
        });

        // Clinic / LabTest / Drug updates (example)
        const recentDrugs = await Drug.find().sort({ createdAt: -1 }).limit(3);
        recentDrugs.forEach((drug) => {
            feed.push({
                type: "info",
                message: `New drug "${drug.name}" added to inventory`,
                date: drug.createdAt,
            });
        });

        // Sort by date descending
        feed.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({ msg: "Activity feed fetched successfully", feed: feed.slice(0, 10) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Failed to fetch activity feed", error });
    }
};


// get monthly billing trend
export const getMonthlyBillingTrend = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    // Aggregate total bill amount per month, only months with bills
    const monthlyBilling = await Billing.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$date" }, // month number (1-12)
          totalAmount: { $sum: "$amount" },
        },
      },
      { $match: { totalAmount: { $gt: 0 } } }, // only months with bills
      { $sort: { "_id": 1 } },
    ]);

    const monthLabels = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    const labels = monthlyBilling.map(item => monthLabels[item._id - 1]);
    const data = monthlyBilling.map(item => item.totalAmount);

    res.status(200).json({ labels, data });
  } catch (error) {
    console.error("Error fetching monthly billing trend:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getSummaryStats = async (req, res) => {
  try {
    const [doctorCount, patientCount, appointmentCount, prescriptionCount, labTestCount] = await Promise.all([
      User.countDocuments({ role: "doctor" }),
      User.countDocuments({ role: "patient" }),
      Appointment.countDocuments(),
      Prescription.countDocuments(),
      LabTest.countDocuments(),
    ]);

    res.status(200).json({
      doctors: doctorCount,
      patients: patientCount,
      appointments: appointmentCount,
      prescriptions: prescriptionCount,
      labTests: labTestCount,
    });
  } catch (error) {
    console.error("Error fetching summary stats:", error);
    res.status(500).json({ msg: "Server error" });
  }
};