import Consultation from "../models/Consultation.js";

export const createConsultation = async (req, res) => {
  try {
    const {
      patient,
      services,
      details,
      temperature,
      weight,
      consultationDate,
      consultationTime,
      health,
      bmi,
    } = req.body;

    if (
      !patient ||
      !services?.length ||
      !details ||
      !temperature ||
      !weight ||
      !consultationDate ||
      !consultationTime
    ) {
      return res.status(400).json({ msg: "All required fields must be filled" });
    }

    const consultation = new Consultation({
      patient,
      services,
      details,
      temperature,
      weight,
      consultationDate,
      consultationTime,
      health,
      bmi,
      createdBy: req.user._id, // from auth middleware
    });

    await consultation.save();

    res.status(201).json({ msg: "Consultation created successfully", consultation });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
