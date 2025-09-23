import PrescriptionSetting from "../models/PrescriptionSetting.js";

// Save or Update Settings
export const savePrescriptionSettings = async (req, res) => {
  try {
    const { companyName, template, fontSize, fontFamily, pageSize, prescriptionFormat, language } = req.body;

    if (!companyName || !template) {
      return res.status(400).json({ error: "Company Name and Template are required" });
    }

    const setting = await PrescriptionSetting.findOneAndUpdate(
      { companyName },
      { template, fontSize, fontFamily, pageSize, prescriptionFormat, language },
      { new: true, upsert: true }
    );

    res.status(201).json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get Settings for a Clinic
export const getPrescriptionSettings = async (req, res) => {
  try {
    const setting = await PrescriptionSetting.findOne({ companyName: req.params.companyName });

    if (!setting) {
      return res.status(404).json({ error: "Settings not found for this company" });
    }

    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createPrescriptionSetting = async (req, res) => {
  try {
    const setting = new PrescriptionSetting(req.body);
    await setting.save();
    res.status(201).json(setting);
  } catch (error) {
    console.error("Error saving prescription setting:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


