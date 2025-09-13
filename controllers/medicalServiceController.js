import MedicalService from '../models/MedicalSer.js';

// CREATE
export const createMedicalService = async (req, res) => {
  try {
    const data = req.body;
    const file = req.file;
    const newService = new MedicalService({
      ...data,
      reportUrl: file?.path || null,
    });
    await newService.save();
    res.status(201).json(newService);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL
export const getAllMedicalServices = async (req, res) => {
  try {
    const all = await MedicalService.find();
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
export const updateMedicalService = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const file = req.file;

    const updated = await MedicalService.findByIdAndUpdate(
      id,
      { ...data, ...(file?.path && { reportUrl: file.path }) },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE
export const deleteMedicalService = async (req, res) => {
  try {
    await MedicalService.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
