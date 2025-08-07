import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // ✅ Only allow superAdmin registration
    if (role !== 'superAdmin') {
      return res.status(403).json({ msg: 'Only superAdmin can self-register' });
    }

    // ✅ Optional: allow only 1 superAdmin in the system
    const existingSuperAdmin = await User.findOne({ role: 'superAdmin' });
    if (existingSuperAdmin) {
      return res.status(400).json({ msg: 'SuperAdmin already exists. Login instead.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword, role });

    res.status(201).json({ msg: 'SuperAdmin registered successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      token,
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// ✅ NEW: Create companyAdmin (accessible only by superAdmin)
const createCompanyAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Prevent duplicate email
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: 'Company admin already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with role companyAdmin
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'companyAdmin',
    });

    res.status(201).json({ msg: 'Company admin created successfully', userId: newUser._id });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

export { register, login, createCompanyAdmin };
