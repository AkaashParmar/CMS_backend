import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import cloudinary from "../config/cloudinary-config.js";
import fs from "fs";

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Only allow superAdmin registration
    if (role !== "superAdmin") {
      return res.status(403).json({ msg: "Only superAdmin can self-register" });
    }

    // allow only 1 superAdmin
    const existingSuperAdmin = await User.findOne({ role: "superAdmin" });
    if (existingSuperAdmin) {
      return res
        .status(400)
        .json({ msg: "SuperAdmin already exists. Login instead." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword, role });

    res.status(201).json({ msg: "SuperAdmin registered successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(400).json({ msg: "Invalid email, role, or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid email, role, or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const {
      otp,
      otpExpires,
      resetPasswordToken,
      resetPasswordExpires,
      ...userData
    } = user._doc;

    res.status(200).json({
      token,
      user: userData,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};


// Create companyAdmin (accessible only by superAdmin)
const createCompanyAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ msg: "Company admin already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with role companyAdmin
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "companyAdmin",
      profile: req.body.profile
    });

    res
      .status(201)
      .json({ msg: "Company admin created successfully", userId: newUser._id });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const message = `Hello ${user.name},\n\nYour OTP for password reset is: ${otp}. It is valid for 10 minutes.\n\nIf you didn't request this, ignore this email.`;

    await sendEmail(user.email, "Password Reset OTP", message);

    res.status(200).json({ msg: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

const resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ msg: "OTP expired" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.status(200).json({ msg: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Create user for doctor, labTechnician, patient, accountant (only by companyAdmin)
const createUserByCompanyAdmin = async (req, res) => {
  try {
    const { name, email, password, role, registrationNo, ...profileData } =
      req.body;

    const allowedRoles = ["doctor", "labTechnician", "patient", "accountant"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        msg: "Invalid role. Allowed roles are doctor, labTechnician, patient, accountant",
      });
    }

    if (role === "doctor" && !registrationNo) {
      return res
        .status(400)
        .json({ msg: "Registration No is required for doctor" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ msg: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let profile = {};

    if (req.body.profile) {
      profile = typeof req.body.profile === 'string' ? JSON.parse(req.body.profile) : req.body.profile;
    }

    // Handle photo upload
    if (req.file && req.file.path) {
      const resultCloud = await cloudinary.uploader.upload(req.file.path, {
        folder: "profiles",
      });

      fs.unlinkSync(req.file.path);
      profile.photo = resultCloud.secure_url;
    }

    let patientId;
    if (role === "patient") {
      const lastPatient = await User.findOne({ role: "patient" })
        .sort({ createdAt: -1 })
        .select("patientId");

      let nextNumber = 1;
      if (lastPatient && lastPatient.patientId) {
        nextNumber = parseInt(lastPatient.patientId.split("-")[1]) + 1;
      }
      patientId = `PID-${String(nextNumber).padStart(3, "0")}`;
    }

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      registrationNo: role === "doctor" ? registrationNo : undefined,
      patientId: role === "patient" ? patientId : undefined,
      profile,
      createdBy: req.user.id,
    });

    res.status(201).json({
      msg: `${role} created successfully with profile`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        registrationNo: newUser.registrationNo,
        patientId: newUser.patientId,
        profile: newUser.profile,
        createdBy: newUser.createdBy,
      },
    });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// get all users created by the logged-in companyAdmin
const getUsersByCompanyAdmin = async (req, res) => {
  try {
    const allowedRoles = ["doctor", "labTechnician", "patient", "accountant"];

    const users = await User.find({
      role: { $in: allowedRoles },
      createdBy: req.user.id,
    })
      .select("-password")
      .lean();

    if (!users || users.length === 0) {
      return res
        .status(404)
        .json({ msg: "No users found for this companyAdmin" });
    }

    res.status(200).json({
      msg: "Users fetched successfully",
      count: users.length,
      users,
    });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

const deleteUserByCompanyAdmin = async (req, res) => {
  try {
    const userId = req.params.id;

    // Ensure the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({ msg: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};


// get single user profile created by the logged-in companyAdmin
const getUserProfileById = async (req, res) => {
  try {
    const allowedRoles = ["doctor", "labTechnician", "patient", "accountant"];
    const { id } = req.params;

    const user = await User.findOne({
      _id: id,
      role: { $in: allowedRoles },
      createdBy: req.user.id,
    }).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ msg: "User not found or not created by this companyAdmin" });
    }

    res.status(200).json({
      msg: "User fetched successfully",
      user,
    });
  } catch (err) {
    console.error("Get user by ID error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (!["doctor", "labTechnician", "patient", "accountant"].includes(user.role)) {
      return res.status(403).json({ msg: "Not authorized to update profile" });
    }

    const { phoneNumber, department } = req.body || {};
    const profileFields = req.body?.profile ? JSON.parse(req.body.profile) : {};

    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (department) user.department = department;

    // Merge profile updates safely
    user.profile = { ...user.profile, ...profileFields };

    // Upload photo if provided
    if (req.file?.path) {
      const resultCloud = await cloudinary.uploader.upload(req.file.path, {
        folder: "profiles",
      });

      fs.unlinkSync(req.file.path);

      user.profile.photo = resultCloud.secure_url;
    }

    await user.save();

    res.json({ msg: "Profile updated successfully", user });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ msg: err.message });
  }
};


// User Roles Distribution (SuperAdmin)
const getUserStats = async (req, res) => {
  try {
    const roles = [
      "patient",
      "doctor",
      "labTechnician",
      "accountant",
      "companyAdmin",
    ];

    const stats = await User.aggregate([
      { $match: { role: { $in: roles } } },
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    // Convert array to object { role: count }
    const counts = {};
    roles.forEach((role) => {
      const found = stats.find((s) => s._id === role);
      counts[role] = found ? found.count : 0;
    });

    const totalUsers = Object.values(counts).reduce((a, b) => a + b, 0);

    res.json({
      msg: "User stats fetched successfully",
      totalUsers,
      counts,
    });
  } catch (err) {
    console.error("User stats error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Get total patients under a specific companyAdmin (clinic)
const getPatientCountByCompanyAdmin = async (req, res) => {
  try {
    // only superAdmin allowed
    if (req.user.role !== "superAdmin") {
      return res.status(403).json({
        message: "Access denied. Only superAdmin can fetch patient counts."
      });
    }

    const { companyAdminId } = req.params; // from route param

    // count patients created by that companyAdmin
    const patientCount = await User.countDocuments({
      createdBy: companyAdminId,
      role: "patient",
    });

    res.status(200).json({
      success: true,
      companyAdminId,
      patientCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};


export {
  register,
  login,
  createCompanyAdmin,
  forgotPassword,
  resetPasswordWithOTP,
  createUserByCompanyAdmin,
  getUsersByCompanyAdmin,
  deleteUserByCompanyAdmin,
  getUserProfileById,
  updateProfile,
  getUserStats,
  getPatientCountByCompanyAdmin,
};
