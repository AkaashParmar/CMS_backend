import StockItem from "../models/StockItem.js";

export const createStockItem = async (req, res) => {
  try {
    // 👇 assume req.user.id is coming from your auth middleware
    const userId = req.user?.id || null;

    const stockItem = new StockItem({
      ...req.body,
      createdBy: userId, // store who created it
    });

    const savedItem = await stockItem.save();

    // Populate creator details if you want to return them
    await savedItem.populate("createdBy", "name email role");

    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getStockItems = async (req, res) => {
  try {
    const items = await StockItem.find().populate("clinic");
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStockItemById = async (req, res) => {
  try {
    const item = await StockItem.findById(req.params.id).populate("clinic");
    if (!item) return res.status(404).json({ message: "Stock Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateStockItem = async (req, res) => {
  try {
    const updatedItem = await StockItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedItem)
      return res.status(404).json({ message: "Stock Item not found" });
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteStockItem = async (req, res) => {
  try {
    const deleted = await StockItem.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Stock Item not found" });
    res.json({ message: "Stock Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
