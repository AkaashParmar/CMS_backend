import StockOut from "../models/StockOut.js";

// create StockOut
export const createStockOut = async (req, res) => {
  try {
    const {
      stockItem,
      createdDate,
      unitPrice,
      quantity,
      description,
      quantityBefore,
    } = req.body;

    const totalPrice = unitPrice * quantity;
    const quantityAfter = quantityBefore - quantity;

    const stockOut = new StockOut({
      stockItem,
      createdDate,
      unitPrice,
      quantity,
      totalPrice,
      description,
      quantityBefore,
      quantityAfter,
      createdBy: req.user?.id,
    });

    await stockOut.save();

    res.status(201).json(stockOut);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// get all StockOut records
export const getAllStockOuts = async (req, res) => {
  try {
    const stockOuts = await StockOut.find();
    res.json(stockOuts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get StockOut by ID
export const getStockOutById = async (req, res) => {
  try {
    const stockOut = await StockOut.findById(req.params.id);

    if (!stockOut) {
      return res.status(404).json({ message: "StockOut not found" });
    }

    res.json(stockOut);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// update StockOut
export const updateStockOut = async (req, res) => {
  try {
    const updatedStockOut = await StockOut.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedStockOut) {
      return res.status(404).json({ message: "StockOut not found" });
    }

    res.json(updatedStockOut);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// delete StockOut
export const deleteStockOut = async (req, res) => {
  try {
    const deletedStockOut = await StockOut.findByIdAndDelete(req.params.id);

    if (!deletedStockOut) {
      return res.status(404).json({ message: "StockOut not found" });
    }

    res.json({ message: "StockOut deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//companyAdmin

// Get StockOut counts grouped by StockItem
export const getStockOutCounts = async (req, res) => {
  try {
    const counts = await StockOut.aggregate([
      {
        $group: {
          _id: "$stockItem",
          totalQuantity: { $sum: "$quantity" },
        },
      },
      {
        $project: {
          _id: 0,
          stockItem: "$_id",
          totalQuantity: 1,
        },
      },
    ]);

    res.json(counts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStockStatus = async (req, res) => {
  try {
    // Fetch all stock out records
    const stockOuts = await StockOut.find({}, "stockItem quantity -_id"); // only stockItem & quantity

    res.status(200).json({
      msg: "Stock status fetched successfully",
      data: stockOuts,
    });
  } catch (err) {
    console.error("Error fetching stock status:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
