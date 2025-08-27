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

    res.status(200).json({
      token,
      user: { name: user.name, email: user.email, role: user.role },
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

    let profile = { ...profileData };

    // Cloudinary Upload for photo
    if (req.file && req.file.path) {
      const resultCloud = await cloudinary.uploader.upload(req.file.path, {
        folder: "profiles",
      });

      fs.unlinkSync(req.file.path);
      profile.photo = resultCloud.secure_url;
    }

    // Generate Patient ID if role = patient
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

// updateProfile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (
      !["doctor", "labTechnician", "patient", "accountant"].includes(user.role)
    ) {
      return res.status(403).json({ msg: "Not authorized to update profile" });
    }

    const {
      fullName,
      email,
      phoneNumber,
      gender,
      dob,
      department,
      ...profileFields
    } = req.body;

    // Update root-level fields
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (gender) user.gender = gender;
    if (dob) user.dob = dob;
    if (department) user.department = department;

    // Update nested profile fields
    user.profile = { ...user.profile, ...profileFields };

    // Cloudinary Upload
    if (req.file && req.file.path) {
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

export {
  register,
  login,
  createCompanyAdmin,
  forgotPassword,
  resetPasswordWithOTP,
  createUserByCompanyAdmin,
  getUsersByCompanyAdmin,
  getUserProfileById,
  updateProfile,
};
