import Prescription from "../models/PrescriptionTemplate.js";

// Create new prescription
export const createPrescription = async (req, res) => {
  try {
    const prescription = new Prescription(req.body);

    // Auto-generate prescriptionId if not set
    if (!prescription.prescriptionId) {
      prescription.prescriptionId = "PR-" + Date.now();
    }

    const savedPrescription = await prescription.save();
    res.status(201).json(savedPrescription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all prescriptions
export const getPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find();
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get prescription by ID
export const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ message: "Not found" });
    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
