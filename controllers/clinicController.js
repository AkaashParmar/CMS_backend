import Clinic from "../models/Clinic.js";

// Create new clinic
export const createClinic = async (req, res) => {
  try {
    const { name, location, phone, primaryDoctor, associatedDoctors, panelDoctors } = req.body;

    const clinic = new Clinic({
      name,
      location,
      phone,
      primaryDoctor,
      associatedDoctors,
      panelDoctors,
    });

    await clinic.save();
    res.status(201).json(clinic);
  } catch (err) {
    res.status(500).json({ message: "Error creating clinic", error: err.message });
  }
};

// Get all clinics
export const getClinics = async (req, res) => {
  try {
    const clinics = await Clinic.find()
      .populate("primaryDoctor", "fullName email")
      .populate("associatedDoctors", "fullName email")
      .populate("panelDoctors", "fullName email");

    res.status(200).json(clinics);
  } catch (err) {
    res.status(500).json({ message: "Error fetching clinics", error: err.message });
  }
};

// Get single clinic
export const getClinicById = async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id)
      .populate("primaryDoctor", "fullName email")
      .populate("associatedDoctors", "fullName email")
      .populate("panelDoctors", "fullName email");

    if (!clinic) return res.status(404).json({ message: "Clinic not found" });

    res.status(200).json(clinic);
  } catch (err) {
    res.status(500).json({ message: "Error fetching clinic", error: err.message });
  }
};

// Update clinic
export const updateClinic = async (req, res) => {
  try {
    const updatedClinic = await Clinic.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedClinic) return res.status(404).json({ message: "Clinic not found" });

    res.status(200).json(updatedClinic);
  } catch (err) {
    res.status(500).json({ message: "Error updating clinic", error: err.message });
  }
};

// Delete / Disable clinic
export const deleteClinic = async (req, res) => {
  try {
    const clinic = await Clinic.findByIdAndDelete(req.params.id);
    if (!clinic) return res.status(404).json({ message: "Clinic not found" });

    res.status(200).json({ message: "Clinic deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting clinic", error: err.message });
  }
};
