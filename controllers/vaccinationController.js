import VaccinationDose from "../models/VaccinationDose.js";
import VaccinationStock from "../models/VaccinationStock.js";
import User from "../models/User.js";
import Clinic from "../models/Clinic.js";
import mongoose from "mongoose";

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

//vaccination stats (companyAdmin Reports)
export const getMonthlyVaccinationStats = async (req, res) => {
  try {
    const result = await VaccinationDose.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          doseCount: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          doseCount: 1
        }
      }
    ]);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching dose count by month:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// Get Patient Vaccination Summary
export const getPatientVaccinationSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await User.findById(id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const vaccineDoses = await VaccinationDose.find({ patient: id });

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
    const doses = await VaccinationDose.find()
      .populate("patient", "name patientId")
      .populate("administeredBy", "name registrationNo")
      .populate("clinic", "clinicName");

    const formatted = doses.map(d => ({
      ...d.toObject(),
      date: d.date.toISOString().split("T")[0],
      patientName: d.patient?.name || "-",
      doctorName: d.administeredBy?.name || "-",
      clinicName: d.clinic?.clinicName || "-",
    }));

    res.json(formatted);
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





export const getPatientsDoctorsClinics = async (req, res) => {
  try {
    // Fetch patients
    const patients = await User.find({ role: "patient" }, { name: 1, patientId: 1, _id: 1 });

    // Fetch doctors
    const doctors = await User.find({ role: "doctor" }, { name: 1, registrationNo: 1, _id: 1 });

    // Fetch clinics
    const clinics = await Clinic.find({}, { clinicName: 1, _id: 1 });

    res.status(200).json({ patients, doctors, clinics });
  } catch (error) {
    console.error("Error fetching entities:", error);
    res.status(500).json({ message: "Server error while fetching patients, doctors, and clinics" });
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


export const getStockStatus = async (req, res) => {
  try {
    const stocks = await VaccinationStock.find();

    const today = new Date();
    let totalAvailable = 0;
    let totalConsumed = 0;
    let expiredCount = 0;
    let lowStockCount = 0;

    stocks.forEach((stock) => {
      totalAvailable += stock.available;
      totalConsumed += stock.consumed;

      // Count expired stock
      if (stock.expiryDate < today) expiredCount += 1;

      // Count low stock (threshold 10, you can adjust)
      if (stock.available <= 10) lowStockCount += 1;
    });

    res.json({
      totalAvailable,
      totalConsumed,
      expiredCount,
      lowStockCount,
      totalBatches: stocks.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};