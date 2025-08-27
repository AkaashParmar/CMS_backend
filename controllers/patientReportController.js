import PatientReport from "../models/Report.js";
import cloudinary from "../config/cloudinary-config.js";
import fs from "fs";

// Upload new report
export const uploadReport = async (req, res) => {
  try {
    const { doctor, comments, status } = req.body;
    const file = req.file; 

    if (!file) return res.status(400).json({ msg: "File is required" });

    // Upload file to Cloudinary
    const resultCloud = await cloudinary.uploader.upload(file.path, {
      folder: "reports",
      resource_type: "auto", // auto-detect pdf, image, etc.
    });

    // Delete local file after upload (cleanup)
    fs.unlinkSync(file.path);

    const newReport = new PatientReport({
      name: file.originalname,
      fileUrl: resultCloud.secure_url, // Cloudinary URL
      date: new Date().toISOString().split("T")[0],
      doctor,
      comments,
      status: status || "Pending Review",
      uploadedBy: req.user?.id || null, 
    });

    await newReport.save();

    res.status(201).json({
      msg: "Report uploaded successfully",
      report: newReport,
    });
  } catch (err) {
    console.error("Upload Report Error:", err);
    res.status(500).json({ msg: "Error uploading report", error: err.message });
  }
};

// Get all reports (with filters + pagination)
export const getReports = async (req, res) => {
  try {
    const { doctor, date, search, page = 1, limit = 5 } = req.query;
    const query = {};

    if (doctor) query.doctor = doctor;
    if (date) query.date = date;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { comments: { $regex: search, $options: "i" } }
      ];
    }

    const reports = await PatientReport.find(query)
      .populate("doctor", "name email role")     
      .populate("uploadedBy", "name email role")   
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await PatientReport.countDocuments(query);

    res.json({
      reports,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching reports", error: err.message });
  }
};


// Get single report
export const getReportById = async (req, res) => {
  try {
    const report = await PatientReport.findById(req.params.id)
      .populate("doctor", "name email role")
      .populate("uploadedBy", "name email role");

    if (!report) return res.status(404).json({ msg: "Report not found" });
    res.json(report);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching report", error: err.message });
  }
};


// Update report, add comments/status
export const updateReport = async (req, res) => {
  try {
    const { comments, status } = req.body;

    const updates = {};
    if (comments !== undefined) updates.comments = comments;
    if (status && ["Pending Review", "Reviewed"].includes(status)) {
      updates.status = status;
    }

    const updated = await PatientReport.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    )
      .populate("doctor", "name email role")
      .populate("uploadedBy", "name email role");

    if (!updated) return res.status(404).json({ msg: "Report not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: "Error updating report", error: err.message });
  }
};


// Delete report
export const deleteReport = async (req, res) => {
  try {
    const deleted = await PatientReport.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Report not found" });
    res.json({ msg: "Report deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting report", error: err.message });
  }
};
