import StockOut from "../models/StockOut.js";
import StockItem from "../models/StockItem.js";

// Create StockOut
export const createStockOut = async (req, res) => {
  try {
    const { stockItem, createdDate, unitPrice, quantity, description, clinic } =
      req.body;

    // Find the stock item
    const item = await StockItem.findById(stockItem);
    if (!item) {
      return res.status(404).json({ message: "Stock item not found" });
    }

    // Calculate values
    const totalPrice = unitPrice * quantity;
    const quantityAfter = item.originalQuantity - quantity;

    if (quantityAfter < 0) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    // Save StockOut
    const stockOut = new StockOut({
      stockItem,
      createdDate,
      unitPrice,
      quantity,
      totalPrice,
      quantityAfter,
      description,
      clinic,
      createdBy: req.user.id,
    });

    await stockOut.save();

    // Update stock item quantity
    item.originalQuantity = quantityAfter;
    await item.save();

    res.status(201).json(stockOut);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all StockOut records
export const getAllStockOuts = async (req, res) => {
  try {
    const stockOuts = await StockOut.find()
      .populate("stockItem", "itemName category")
      .populate("clinic", "name");
    res.json(stockOuts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get StockOut by ID
export const getStockOutById = async (req, res) => {
  try {
    const stockOut = await StockOut.findById(req.params.id)
      .populate("stockItem", "itemName category")
      .populate("clinic", "name");

    if (!stockOut)
      return res.status(404).json({ message: "StockOut not found" });

    res.json(stockOut);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update StockOut
export const updateStockOut = async (req, res) => {
  try {
    const updatedStockOut = await StockOut.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedStockOut)
      return res.status(404).json({ message: "StockOut not found" });

    res.json(updatedStockOut);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete StockOut
export const deleteStockOut = async (req, res) => {
  try {
    const deletedStockOut = await StockOut.findByIdAndDelete(req.params.id);

    if (!deletedStockOut)
      return res.status(404).json({ message: "StockOut not found" });

    res.json({ message: "StockOut deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
