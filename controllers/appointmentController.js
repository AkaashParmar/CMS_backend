import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Create Appointment
export const createAppointment = async (req, res) => {
  try {
    const { patient, date, time, contact, services, doctor } = req.body;

    // Validate patient
    const patientData = await User.findById(patient).select("name email");
    if (!patientData) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Validate doctor
    const doctorData = await User.findById(doctor).select("name email");
    if (!doctorData) {
      return res.status(400).json({ message: "Doctor not found" });
    }

    const appointment = new Appointment({
      patient,
      date,
      time,
      contact,
      services,
      doctor,
      createdBy: req.user.id,
    });

    const saved = await appointment.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const getPatientsAndDoctors = async (req, res) => {
  try {
    // Fetch patients
    const patients = await User.find({ role: "patient" }).select("name patientId");

    // Fetch doctors
    const doctors = await User.find({ role: "doctor" }).select("name registrationNo");

    // Return both in a single response
    res.status(200).json({ patients, doctors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!doctorId) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }

    // doctor ke appointments fetch karo
    const appointments = await Appointment.find({ doctor: doctorId })
      .populate("patient", "name email patientId") // patient ka data bhi show hoga
      .populate("doctor", "name email registrationNo") // doctor ka basic info
      .sort({ date: 1, time: 1 }); // date aur time ke order me

    if (!appointments.length) {
      return res.status(404).json({ message: "No appointments found for this doctor" });
    }

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// Get All Appointments
export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().populate(
      "patient",
      "name email patientId"
    ).populate("doctor", "name email profile.phoneNumber");

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

// companyAdmin Dshboard

// Get Total Appointments Count (CompanyAdmin)
export const getAppointmentsCount = async (req, res) => {
  try {
    const count = await Appointment.countDocuments();
    res.json({ totalAppointments: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Appointment Status Counts
export const getAppointmentStatusCounts = async (req, res) => {
  try {
    const statusCounts = await Appointment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert to a clean object format
    const result = {
      Pending: 0,
      Scheduled: 0,
      Completed: 0,
      Cancelled: 0,
    };

    statusCounts.forEach((item) => {
      result[item._id] = item.count;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//for patient dashboard
export const getUpcomingAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: "Invalid patientId" });
    }

    const todayDateString = new Date().toISOString().split('T')[0];

    const appointments = await Appointment.find({
      patient: patientId,
      date: { $gte: todayDateString }
    }).populate("doctor", "name")
      .sort({ date: 1, time: 1 });

    // Map and return only required fields
    const formattedAppointments = appointments.map(appt => ({
      doctorName: appt.doctor.name,
      date: appt.date,
      time: appt.time,
      services: appt.services
    }));

    res.status(200).json(formattedAppointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
