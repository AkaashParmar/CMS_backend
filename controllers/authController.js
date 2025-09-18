import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import cloudinary from "../config/cloudinary-config.js";
import fs from "fs";
import Billing from '../models/Billing.js';
import mongoose from "mongoose";

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

    // ✅ Update lastLogin
    user.lastLogin = new Date();
    await user.save();

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
      password: userPassword, // optional: remove password
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

const createCompanyAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ msg: "Company admin already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Initialize profile
    let profile = {};
    if (req.body.profile) {
      profile =
        typeof req.body.profile === "string"
          ? JSON.parse(req.body.profile)
          : req.body.profile;
    }

    // Handle photo upload
    if (req.file && req.file.path) {
      const resultCloud = await cloudinary.uploader.upload(req.file.path, {
        folder: "profiles",
      });

      fs.unlinkSync(req.file.path); // remove local file
      profile.photo = resultCloud.secure_url;
    }

    // Create companyAdmin
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "companyAdmin",
      profile,
    });

    res.status(201).json({
      msg: "Company admin created successfully",
      userId: newUser._id,
      profile: newUser.profile,
    });
  } catch (err) {
    console.error("Create companyAdmin error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};


// Update Company Admin
const updateCompanyAdmin = async (req, res) => {
  try {
    const { id } = req.params; // companyAdmin ID to update
    const { name, email, password } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid company admin ID" });
    }

    // Find existing user
    const existingUser = await User.findById(id);
    if (!existingUser || existingUser.role !== "companyAdmin") {
      return res.status(404).json({ msg: "Company admin not found" });
    }

    // Prepare updated fields
    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Handle profile updates
    let profile = existingUser.profile || {};
    if (req.body.profile) {
      const incomingProfile =
        typeof req.body.profile === "string"
          ? JSON.parse(req.body.profile)
          : req.body.profile;
      profile = { ...profile, ...incomingProfile };
    }

    // Handle photo upload
    if (req.file && req.file.path) {
      const resultCloud = await cloudinary.uploader.upload(req.file.path, {
        folder: "profiles",
      });
      fs.unlinkSync(req.file.path);
      profile.photo = resultCloud.secure_url;
    }

    updateData.profile = profile;

    // Update user
    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");

    res.status(200).json({
      msg: "Company admin updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update companyAdmin error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

const getCompanyAdmins = async (req, res) => {
  try {
    // Fetch users with role "companyAdmin"
    const companyAdmins = await User.find({ role: "companyAdmin" }).select(
      "-password"
    );

    res.status(200).json({
      success: true,
      count: companyAdmins.length,
      data: companyAdmins,
    });
  } catch (err) {
    console.error("Get companyAdmins error:", err);
    res.status(500).json({ success: false, msg: "Server error", error: err.message });
  }
};


const getEmployeeCountsByCompanyAdmin = async (req, res) => {
  try {
    const { companyAdminId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(companyAdminId)) {
      return res.status(400).json({ success: false, message: "Invalid companyAdminId" });
    }

    // Fetch companyAdmin's name
    const companyAdmin = await User.findById(companyAdminId).select("name");

    if (!companyAdmin) {
      return res.status(404).json({ success: false, message: "Company Admin not found" });
    }

    // Aggregate employee counts grouped by role
    const counts = await User.aggregate([
      { $match: { createdBy: new mongoose.Types.ObjectId(companyAdminId) } },
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {};
    counts.forEach(item => {
      result[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      data: {
        companyAdmin: {
          id: companyAdminId,
          name: companyAdmin.name
        },
        employeeCounts: result
      }
    });
  } catch (err) {
    console.error("Error fetching employee counts:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getCompanyName = async (req, res) => {
  try {
    // Ensure the requester is superAdmin
    if (req.user.role !== "superAdmin") {
      return res.status(403).json({ message: "Access denied ❌" });
    }

    const companyAdmins = await User.find({ role: "companyAdmin" }).select(
      "name email profile.companyName"
    );

    res.status(200).json(companyAdmins);
  } catch (error) {
    console.error("Error fetching company admins:", error);
    res.status(500).json({ message: "Server error ❌" });
  }
};

// Get single companyAdmin by ID
const getCompanyAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, msg: "Invalid ID" });
    }

    const admin = await User.findOne({ _id: id, role: "companyAdmin" }).select("-password");

    if (!admin) {
      return res.status(404).json({ success: false, msg: "Company admin not found" });
    }

    res.status(200).json({ success: true, data: admin });
  } catch (err) {
    console.error("Get companyAdmin by ID error:", err);
    res.status(500).json({ success: false, msg: "Server error", error: err.message });
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

// get all users created by the logged-in companyAdmin
const getPatientsInDoctor = async (req, res) => {
  try {
    let patients;

    if (req.user.role === "doctor") {
      // Doctors can see all patients
      patients = await User.find({ role: "patient" })
        .select("-password")
        .lean();
    } else if (req.user.role === "companyAdmin") {
      // CompanyAdmins see patients they created
      patients = await User.find({ role: "patient", createdBy: req.user.id })
        .select("-password")
        .lean();
    } else {
      return res.status(403).json({ msg: "Access denied" });
    }

    if (!patients || patients.length === 0) {
      return res.status(404).json({ msg: "No patients found" });
    }

    res.status(200).json({
      msg: "Patients fetched successfully",
      count: patients.length,
      patients,
    });
  } catch (err) {
    console.error("Get patients error:", err);
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
    const allowedRoles = ["doctor", "labTechnician", "patient", "accountant", "companyAdmin"];
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

    if (!["doctor", "labTechnician", "patient", "accountant", "companyAdmin"].includes(user.role)) {
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

const getPatientsForCompanyAdmin = async (req, res) => {
  try {
    // Check that the requester is superAdmin
    if (req.user.role !== "superAdmin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const patients = await User.find({ role: "patient" })
      .populate("createdBy", "name email")
      .select("name email patientId createdBy");

    res.status(200).json({
      success: true,
      patients: patients.map((patient) => ({
        patientName: patient.name,
        patientEmail: patient.email,
        patientId: patient.patientId,
        companyAdmin: patient.createdBy
          ? {
            name: patient.createdBy.name,
            email: patient.createdBy.email,
          }
          : null,
      })),
    });
  } catch (error) {
    console.error("Error fetching patients for superAdmin:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getCompanyAdminRevenue = async (req, res) => {
  try {
    const companyAdminId = req.user.id;
    console.log('CompanyAdminId:', companyAdminId);

    const result = await Billing.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "patientId",
          foreignField: "_id",
          as: "patient"
        }
      },
      { $unwind: "$patient" },
      {
        $match: { "patient.createdBy": new mongoose.Types.ObjectId(companyAdminId) }

      },
      {
        $group: {
          _id: "$patient.createdBy",
          totalRevenue: { $sum: "$amount" }
        }
      }
    ]);

    console.log('Aggregation Result:', result);

    const totalRevenue = result.length > 0 ? result[0].totalRevenue : 0;

    res.status(200).json({
      success: true,
      totalRevenue
    });
  } catch (error) {
    console.error('Aggregation Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getMonthlyLoginStats = async (req, res) => {
  try {
    const matchFilter = {
      role: { $in: ["patient", "doctor", "companyAdmin", "accountant"] },
      lastLogin: { $exists: true },
    };

    if (req.user.role === "companyAdmin") {
      matchFilter.createdBy = mongoose.Types.ObjectId(req.user.id);
    }

    const stats = await User.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { $month: "$lastLogin" },
          logins: { $sum: 1 },
        },
      },
      {
        $project: {
          monthNumber: "$_id",
          logins: 1,
          _id: 0,
        },
      },
      { $sort: { monthNumber: 1 } },
    ]);

    // Convert month number to month name
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const formattedStats = stats.map(stat => ({
      month: monthNames[stat.monthNumber - 1],
      logins: stat.logins
    }));

    res.status(200).json({
      success: true,
      data: formattedStats,
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Server error", error: err.message });
  }
};

export {
  register,
  login,
  createCompanyAdmin,
  updateCompanyAdmin,
  getCompanyAdmins,
  getEmployeeCountsByCompanyAdmin,
  getCompanyName,
  getCompanyAdminById,
  forgotPassword,
  resetPasswordWithOTP,
  createUserByCompanyAdmin,
  getUsersByCompanyAdmin,
  getPatientsInDoctor,
  deleteUserByCompanyAdmin,
  getUserProfileById,
  updateProfile,
  getUserStats,
  getPatientsForCompanyAdmin,
  getCompanyAdminRevenue,
  getMonthlyLoginStats,
};
