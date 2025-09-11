import Service from '../models/Service.js';

// Create Service
export const createService = async (req, res) => {
  try {
    const { name, price, status, description } = req.body;
    if (!name || price == null) {
      return res.status(400).json({ message: 'Name and price are required' });
    }
    const newService = await Service.create({ name, price, status, description });
    res.status(201).json(newService);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get All (with search / status / pagination)
export const getServices = async (req, res) => {
  try {
    const { search = '', status = '', page = 1, limit = 5 } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (status) query.status = status;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const lim = Math.max(parseInt(limit, 10) || 5, 1);

    const total = await Service.countDocuments(query);
    const services = await Service.find(query)
      .skip((pageNum - 1) * lim)
      .limit(lim)
      .sort({ createdAt: -1 });

    res.json({ services, total, page: pageNum, limit: lim });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Single
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update
export const updateService = async (req, res) => {
  try {
    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Service not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete
export const deleteService = async (req, res) => {
  try {
    const deleted = await Service.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Service not found' });
    res.json({ message: 'Service deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
