import LabTest from "../models/LabResult.js";

//Add new test
export const createLabTest = async (req, res) => {
  try {
    const { name, unit, min, max } = req.body;

    const test = new LabTest({
      name,
      unit,
      min,
      max,
      createdBy: req.user.id, 
    });

    await test.save();
    res.status(201).json(test);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating lab test", error: err.message });
  }
};

// Get all tests
export const getLabTests = async (req, res) => {
  try {
    const tests = await LabTest.find();
    res.status(200).json(tests);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching lab tests", error: err.message });
  }
};

// Get single test
export const getLabTestById = async (req, res) => {
  try {
    const test = await LabTest.findById(req.params.id);
    if (!test) return res.status(404).json({ message: "Lab test not found" });
    res.status(200).json(test);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching lab test", error: err.message });
  }
};

// Update test
export const updateLabTest = async (req, res) => {
  try {
    const test = await LabTest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!test) return res.status(404).json({ message: "Lab test not found" });
    res.status(200).json(test);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating lab test", error: err.message });
  }
};

// Delete test
export const deleteLabTest = async (req, res) => {
  try {
    const test = await LabTest.findByIdAndDelete(req.params.id);
    if (!test) return res.status(404).json({ message: "Lab test not found" });
    res.status(200).json({ message: "Lab test deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting lab test", error: err.message });
  }
};

// Count total lab tests
export const countLabTests = async (req, res) => {
  try {
    const total = await LabTest.countDocuments();
    res.status(200).json({ total });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error counting lab tests", error: err.message });
  }
};

