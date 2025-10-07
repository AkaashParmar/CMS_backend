import Appointment from "../models/Appointment.js";
import User from "../models/User.js";

// ✅ Create a new appointment request
export const createAppointment = async (req, res) => {
  try {
    const {
      patientId,
      patientName,
      doctorId,
      doctorName,
      dateTime,
      reason,
      status,
      companyName,
    } = req.body;

    const newAppointment = new Appointment({
      patientId,
      patientName,
      doctorId,
      doctorName,
      dateTime,
      reason,
      status: status || "Pending",
      companyName,
    });

    await newAppointment.save();
    res
      .status(201)
      .json({ message: "Appointment created successfully", appointment: newAppointment });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ message: "Failed to create appointment" });
  }
};

// ✅ Fetch all appointments (Admin panel / Search)
export const getAllAppointments = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { patientName: { $regex: search, $options: "i" } },
        { doctorName: { $regex: search, $options: "i" } },
        { patientId: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({ total, page: parseInt(page), appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
};

// ✅ Update appointment status (Approve / Cancel / Reschedule)
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { status, comment },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res
      .status(200)
      .json({ message: "Status updated successfully", appointment: updatedAppointment });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ message: "Failed to update appointment status" });
  }
};

// ✅ Delete appointment
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Appointment.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ message: "Failed to delete appointment" });
  }
};

// ✅ Keep route: /appointments/patients-doctors (use your User model)
export const getPatientsAndDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select(
      "name _id profile.companyName"
    );
    const patients = await User.find({ role: "patient" }).select(
      "name _id patientId profile.companyName"
    );

    res.status(200).json({ doctors, patients });
  } catch (error) {
    console.error("Error fetching doctors/patients:", error);
    res.status(500).json({ message: "Failed to fetch doctors and patients" });
  }
};
