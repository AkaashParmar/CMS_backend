import PrescriptionSetting from "../models/PrescriptionSetting.js";

// Save or Update Settings
export const savePrescriptionSettings = async (req, res) => {
  try {
    const {
      companyId,
      companyName,
      template,
      fontSize,
      fontFamily,
      pageSize,
      prescriptionFormat,
      language,
    } = req.body;

    if (!companyId || !companyName || !template) {
      return res.status(400).json({
        error: "companyId, companyName and template are required",
      });
    }

    const condition = { companyId };

    const update = {
      companyName,
      template,
      fontSize,
      fontFamily,
      pageSize,
      prescriptionFormat,
      language,
    };

    const options = {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,  // ensure defaults from schema apply when inserting
    };

    const setting = await PrescriptionSetting.findOneAndUpdate(
      condition,
      update,
      options
    );

    return res.status(200).json({ success: true, data: setting });
  } catch (err) {
    console.error("Error saving prescription settings:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Get Settings for a Clinic
export const getPrescriptionSettings = async (req, res) => {
  try {
    const companyId = req.params.companyId;
    if (!companyId) {
      return res.status(400).json({ message: "companyId is required" });
    }

    const setting = await PrescriptionSetting.findOne({ companyId });

    if (!setting) {
      return res.status(404).json({ message: "Settings not found" });
    }

    return res.status(200).json({ success: true, data: setting });
  } catch (err) {
    console.error("Error fetching settings:", err);
    return res.status(500).json({ success: false, error: err.message });
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


