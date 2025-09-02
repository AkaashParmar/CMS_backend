import Appointment from "../models/Appointment.js";
import User from "../models/User.js";

// Create Appointment
export const createAppointment = async (req, res) => {
  try {
    const { patient, date, time, contact, services, doctorId } = req.body;

    const patientData = await User.findById(patient).select(
      "patientId name email"
    );
    if (!patientData) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const appointment = new Appointment({
      patient,
      patientId: patientData.patientId,
      date,
      time,
      contact,
      services,
      doctorId,
    });

    const saved = await appointment.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get All Appointments
export const getAppointments = async (req, res) => {
  try {
    
    const appointments = await Appointment.find().populate(
      "patient",
      "name email patientId"
    );

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Appointment by ID
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate(
      "patient",
      "name email patientId"
    ); 

    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Appointment
export const updateAppointment = async (req, res) => {
  try {
    const { patient, ...rest } = req.body;
    let updateData = { ...rest };

    if (patient) {
      const patientData = await User.findById(patient).select("patientId");
      if (!patientData) {
        return res.status(404).json({ message: "Patient not found" });
      }
      updateData.patient = patient;
      updateData.patientId = patientData.patientId;
    }

    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
      }
    ).populate("patient", "name email patientId");

    if (!updated)
      return res.status(404).json({ message: "Appointment not found" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Appointment
export const deleteAppointment = async (req, res) => {
  try {
    const deleted = await Appointment.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Appointment not found" });
    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
