import Prescription from "../models/PrescriptionTemplate.js";
import User from '../models/User.js';
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary-config.js";
import fs from "fs";
import { PrescriptionTemplate } from '../models/Prescription.js'


export const createPrescription = async (req, res) => {
  try {
    let prescriptionData = { ...req.body };

    // Parse JSON fields if sent as string (common with multipart/form-data)
    if (req.body.referral && typeof req.body.referral === "string") {
      prescriptionData.referral = JSON.parse(req.body.referral);
    }
    if (req.body.prescription && typeof req.body.prescription === "string") {
      prescriptionData.prescription = JSON.parse(req.body.prescription);
    }

    if (req.file && req.file.path) {
      const resultCloud = await cloudinary.uploader.upload(req.file.path, {
        folder: "prescriptions",
      });
      prescriptionData.signature = resultCloud.secure_url;
    }

    // Auto-generate prescriptionId if not provided
    if (!prescriptionData.prescriptionId) {
      prescriptionData.prescriptionId = "PR-" + Date.now();
    }

    const prescription = new Prescription({
      ...prescriptionData,
      template: prescriptionData.template,
    });

    const savedPrescription = await prescription.save();
    res.status(201).json(savedPrescription);
  } catch (error) {
    console.error("Create prescription error:", error);
    res.status(400).json({ message: error.message });
  }
};


export const getPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate('patient', 'name patientId');

    const formattedPrescriptions = prescriptions.map((p) => ({
      ...p._doc,
      patient: p.patient ? { name: p.patient.name, patientId: p.patient.patientId } : null,
      date: p.date ? p.date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : null,
      // nextVisit: p.nextVisit ? p.nextVisit.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : null,
      followUp: p.followUp ? p.followUp.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : null,
    }));

    res.json(formattedPrescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ message: "Not found" });
    }

    const patient = await User.findOne({ patientId: prescription.patientId });

    const formattedPrescription = {
      ...prescription._doc,
      patient: patient ? { name: patient.name, patientId: patient.patientId } : null,
      date: prescription.date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      // nextVisit: prescription.nextVisit.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      followUp: prescription.followUp?.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    };

    res.json(formattedPrescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecentPrescriptions = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const limit = parseInt(req.query.limit) || 5; // Limit number of results (default: 5)

    const prescriptions = await Prescription.find({ patient: patientId })
      .sort({ createdAt: -1 }) // Most recent first
      .limit(limit);

    const formatted = prescriptions.map((p) => ({
      _id: p._id,
      prescriptionId: p.prescriptionId,
      date: p.date.toISOString().split("T")[0],
      doctorName: p.doctorName,
      complaints: p.complaints,
      diagnosis: p.diagnosis,
      prescription: p.prescription,
      followUp: p.followUp ? p.followUp.toISOString().split("T")[0] : null,
    }));

    res.status(200).json({
      msg: "Recent prescriptions fetched successfully",
      prescriptions: formatted,
    });
  } catch (err) {
    console.error("Error fetching recent prescriptions:", err);
    res.status(500).json({ msg: "Error fetching prescriptions", error: err.message });
  }
};


// Template Settings (superAdmin)
// Save Prescription Template Settings

export const createPrescriptionTemplate = async (req, res) => {
  try {
    const {
      clinic,
      template,
      fontSize,
      pageSize,
      prescriptionFormat,
      fontFamily,
      language,
    } = req.body;

    console.log("Incoming body:", req.body);

    if (!clinic) {
      return res.status(400).json({ message: "Clinic is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(clinic)) {
      return res.status(400).json({ message: "Invalid Clinic ID" });
    }

    const newTemplate = new PrescriptionTemplate({
      clinic: [clinic],
      template,
      fontSize,
      pageSize,
      prescriptionFormat,
      fontFamily,
      language,
      createdBy: req.user.id,
    });

    await newTemplate.save();

    res.status(201).json({ message: "Template saved successfully ✅" });
  } catch (error) {
    console.error("Error saving template:", error);  // Logs the full error
    res.status(500).json({ message: "Failed to save template ❌", error: error.message });
  }
};

// Get Prescription Templates
export const getPrescriptionTemplates = async (req, res) => {
  try {
    // Optional: filter by createdBy so each user only sees their templates
    const templates = await PrescriptionTemplate.find()
      .populate("clinic", "clinicName")
      .sort({ createdAt: -1 });


    res.status(200).json({
      message: "Templates fetched successfully ✅",
      templates,
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ message: "Failed to fetch templates ❌", error: error.message });
  }
};
