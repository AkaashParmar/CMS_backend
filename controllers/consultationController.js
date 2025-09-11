import Consultation from "../models/Consultation.js";
import User from "../models/User.js";


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

    // Get last consultation to determine next ID
    const lastConsultation = await Consultation.findOne()
      .sort({ createdAt: -1 })
      .select("consultationId")
      .exec();

    let nextIdNumber = 1001;
    if (lastConsultation?.consultationId) {
      const lastIdNumber = parseInt(lastConsultation.consultationId.split("-")[1]);
      nextIdNumber = lastIdNumber + 1;
    }

    const consultationId = `CONS-${nextIdNumber}`;

    const consultation = new Consultation({
      consultationId,
      patient,
      services,
      details,
      temperature,
      weight,
      consultationDate: new Date(consultationDate),
      consultationTime,
      health,
      bmi,
      createdBy: req.user.id,
    });

    await consultation.save();

    res.status(201).json({ msg: "Consultation created successfully", consultation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};


export const getConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find()
      .populate("patient", "name patientId") 
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 });


    return res.status(200).json({
      msg: "Consultations fetched successfully",
      consultations,
    });
  } catch (err) {
    console.error("Error fetching consultations:", err);
    return res.status(500).json({
      msg: "Server error while fetching consultations",
      error: err.message,
    });
  }
};

