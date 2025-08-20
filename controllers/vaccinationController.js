import VaccinationDose from "../models/VaccinationDose.js";
import VaccinationStock from "../models/VaccinationStock.js";

// Create Dose Record
export const createDose = async (req, res) => {
  try {
    const dose = new VaccinationDose(req.body);
    const saved = await dose.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get All Dose Records
export const getDoses = async (req, res) => {
  try {
    const doses = await VaccinationDose.find();
    res.json(doses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Single Dose
export const getDoseById = async (req, res) => {
  try {
    const dose = await VaccinationDose.findById(req.params.id);
    if (!dose) return res.status(404).json({ message: "Dose not found" });
    res.json(dose);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// STOCK CONTROLLERS

// Create Stock Entry
export const createStock = async (req, res) => {
  try {
    const stock = new VaccinationStock(req.body);
    const saved = await stock.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get All Stock
export const getStocks = async (req, res) => {
  try {
    const stocks = await VaccinationStock.find();
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Single Stock
export const getStockById = async (req, res) => {
  try {
    const stock = await VaccinationStock.findById(req.params.id);
    if (!stock) return res.status(404).json({ message: "Stock not found" });
    res.json(stock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Stock
export const updateStock = async (req, res) => {
  try {
    const updatedStock = await VaccinationStock.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } 
    );

    if (!updatedStock)
      return res.status(404).json({ message: "Stock not found" });

    res.json(updatedStock);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete Stock
export const deleteStock = async (req, res) => {
  try {
    const deleted = await VaccinationStock.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Stock not found" });
    res.json({ message: "Stock deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};