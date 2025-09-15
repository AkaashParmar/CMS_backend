import Prescription from "../models/PrescriptionTemplate.js";
import User from '../models/User.js';

export const createPrescription = async (req, res) => {
  try {
    const prescription = new Prescription(req.body);

    if (!prescription.prescriptionId) {
      prescription.prescriptionId = "PR-" + Date.now();
    }

    const savedPrescription = await prescription.save();
    res.status(201).json(savedPrescription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate('patient', 'name patientId');

    const formattedPrescriptions = prescriptions.map((p) => ({
      ...p._doc,
      patient: p.patient ? { name: p.patient.name, patientId: p.patient.patientId } : null,
      date: p.date ? p.date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : null,
      // nextVisit: p.nextVisit ? p.nextVisit.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : null,
      followUp: p.followUp ? p.followUp.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : null,
    }));

    res.json(formattedPrescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ message: "Not found" });
    }

    const patient = await User.findOne({ patientId: prescription.patientId });

    const formattedPrescription = {
      ...prescription._doc,
      patient: patient ? { name: patient.name, patientId: patient.patientId } : null,
      date: prescription.date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      // nextVisit: prescription.nextVisit.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      followUp: prescription.followUp?.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    };

    res.json(formattedPrescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecentPrescriptions = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const limit = parseInt(req.query.limit) || 5; // Limit number of results (default: 5)

    const prescriptions = await Prescription.find({ patient: patientId })
      .sort({ createdAt: -1 }) // Most recent first
      .limit(limit);

    const formatted = prescriptions.map((p) => ({
      _id: p._id,
      prescriptionId: p.prescriptionId,
      date: p.date.toISOString().split("T")[0],
      doctorName: p.doctorName,
      complaints: p.complaints,
      diagnosis: p.diagnosis,
      prescription: p.prescription,
      followUp: p.followUp ? p.followUp.toISOString().split("T")[0] : null,
    }));

    res.status(200).json({
      msg: "Recent prescriptions fetched successfully",
      prescriptions: formatted,
    });
  } catch (err) {
    console.error("Error fetching recent prescriptions:", err);
    res.status(500).json({ msg: "Error fetching prescriptions", error: err.message });
  }
};

