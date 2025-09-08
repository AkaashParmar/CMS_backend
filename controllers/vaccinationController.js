import VaccinationDose from "../models/VaccinationDose.js";
import VaccinationStock from "../models/VaccinationStock.js";
import User from "../models/User.js";

// Auto-generate Dose ID
const generateDoseId = async () => {
  const lastDose = await VaccinationDose.findOne().sort({ createdAt: -1 });
  let nextId = 1001;
  if (lastDose && lastDose.doseId) {
    const lastIdNum = parseInt(lastDose.doseId.split("-")[1]);
    nextId = lastIdNum + 1;
  }
  return `DOSE-${nextId}`;
};

// Create Dose
export const createDose = async (req, res) => {
  try {
    const { patientId, ...doseData } = req.body;

    // Ensure patient exists
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Generate new doseId
    const doseId = await generateDoseId();

    // Create dose record
    const dose = new VaccinationDose({
      doseId,
      patient: patient._id,
      patientName: patient.name,
      ...doseData,
    });

    const savedDose = await dose.save();

    // Update patient record with doseId
    patient.vaccineDoses.push(savedDose._id);
    await patient.save();

    const formattedDose = {
      ...savedDose.toObject(),
      date: savedDose.date.toISOString().split('T')[0]  
    };

    res.status(201).json(formattedDose);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// Get Patient Vaccination Summary
export const getPatientVaccinationSummary = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const vaccineDoses = await VaccinationDose.find({ patient: patientId });

    const today = new Date();

    const formatDose = (d) => ({
      vaccine: d.vaccine,
      status: d.status,
      date: d.date.toISOString().split("T")[0],
      time: d.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      location: d.clinic,
      givenBy: d.administeredBy || null,
    });

    // Categorize doses
    const vaccinesTaken = vaccineDoses
      .filter((d) => d.status === "Completed")
      .map(formatDose);

    const pendingVaccines = vaccineDoses
      .filter((d) => d.status === "Pending" && new Date(d.date) <= today)
      .map(formatDose);

    const upcomingVaccines = vaccineDoses
      .filter((d) => d.status === "Pending" && new Date(d.date) > today)
      .map(formatDose);

    res.json({
      patient: patient.name,
      vaccinesTaken,
      pendingVaccines,
      upcomingVaccines,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get All Dose Records
export const getDoses = async (req, res) => {
  try {
    const doses = await VaccinationDose.find();
    res.json(doses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Single Dose
export const getDoseById = async (req, res) => {
  try {
    const dose = await VaccinationDose.findById(req.params.id);
    if (!dose) return res.status(404).json({ message: "Dose not found" });
    res.json(dose);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//vaccination stats (companyAdmin Reports)
export const getMonthlyVaccinationStats = async (req, res) => {
  try {
    const stats = await VaccinationDose.aggregate([
      {
        $match: { status: "Completed" },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          totalDoses: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    // Map month numbers to month names
    const monthNames = [
      "",
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const formattedStats = stats.map(stat => ({
      year: stat._id.year,
      month: monthNames[stat._id.month], 
      totalDoses: stat.totalDoses,
    }));

    res.status(200).json({ success: true, data: formattedStats });
  } catch (error) {
    console.error("Error getting monthly vaccination stats:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};



// STOCK CONTROLLERS

// Create Stock Entry
export const createStock = async (req, res) => {
  try {
    const stock = new VaccinationStock(req.body);
    const saved = await stock.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get All Stock
export const getStocks = async (req, res) => {
  try {
    const stocks = await VaccinationStock.find();
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Single Stock
export const getStockById = async (req, res) => {
  try {
    const stock = await VaccinationStock.findById(req.params.id);
    if (!stock) return res.status(404).json({ message: "Stock not found" });
    res.json(stock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Stock
export const updateStock = async (req, res) => {
  try {
    const updatedStock = await VaccinationStock.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedStock)
      return res.status(404).json({ message: "Stock not found" });

    res.json(updatedStock);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete Stock
export const deleteStock = async (req, res) => {
  try {
    const deleted = await VaccinationStock.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Stock not found" });
    res.json({ message: "Stock deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
