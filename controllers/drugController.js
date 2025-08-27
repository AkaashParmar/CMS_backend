import Drug from "../models/Drug.js";

// Add Drug
export const createDrug = async (req, res) => {
  try {
    const { name, category, manufacturer, quantity, price, expiry } = req.body;

    const drug = new Drug({
      name,
      category,
      manufacturer,
      quantity,
      price,
      expiry,
    });
    await drug.save();

    res.status(201).json(drug);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating drug", error: err.message });
  }
};

// Get All Drugs
export const getDrugs = async (req, res) => {
  try {
    const drugs = await Drug.find();
    res.status(200).json(drugs);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching drugs", error: err.message });
  }
};

// // Get Drug by ID
// export const getDrugById = async (req, res) => {
//   try {
//     const drug = await Drug.findById(req.params.id);
//     if (!drug) return res.status(404).json({ message: "Drug not found" });

//     res.status(200).json(drug);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching drug", error: err.message });
//   }
// };

// Update Drug
export const updateDrug = async (req, res) => {
  try {
    const updatedDrug = await Drug.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedDrug)
      return res.status(404).json({ message: "Drug not found" });

    res.status(200).json(updatedDrug);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating drug", error: err.message });
  }
};

// Delete Drug
export const deleteDrug = async (req, res) => {
  try {
    const drug = await Drug.findByIdAndDelete(req.params.id);
    if (!drug) return res.status(404).json({ message: "Drug not found" });

    res.status(200).json({ message: "Drug deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting drug", error: err.message });
  }
};
