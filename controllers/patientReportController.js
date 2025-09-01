import PatientReport from "../models/Report.js";
import cloudinary from "../config/cloudinary-config.js";
import fs from "fs";

// // Upload new report
// export const uploadReport = async (req, res) => {
//   try {
//     const { doctor, comments, status } = req.body;
//     const file = req.file;

//     if (!file) return res.status(400).json({ msg: "File is required" });

//     // Upload file to Cloudinary
//     const resultCloud = await cloudinary.uploader.upload(file.path, {
//       folder: "reports",
//       resource_type: "auto", // auto-detect pdf, image, etc.
//     });

//     // Delete local file after upload (cleanup)
//     fs.unlinkSync(file.path);

//     const newReport = new PatientReport({
//       name: file.originalname,
//       fileUrl: resultCloud.secure_url, // Cloudinary URL
//       date: new Date().toISOString().split("T")[0],
//       doctor,
//       comments,
//       status: status || "Pending Review",
//       uploadedBy: req.user?.id || null,
//     });

//     await newReport.save();

//     res.status(201).json({
//       msg: "Report uploaded successfully",
//       report: newReport,
//     });
//   } catch (err) {
//     console.error("Upload Report Error:", err);
//     res.status(500).json({ msg: "Error uploading report", error: err.message });
//   }
// };

// // Get all reports (with filters + pagination)
// export const getReports = async (req, res) => {
//   try {
//     const { doctor, date, search, page = 1, limit = 5 } = req.query;
//     const query = {};

//     if (doctor) query.doctor = doctor;
//     if (date) query.date = date;

//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: "i" } },
//         { comments: { $regex: search, $options: "i" } }
//       ];
//     }

//     const reports = await PatientReport.find(query)
//       .populate("doctor", "name email role")
//       .populate("uploadedBy", "name email role")
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(Number(limit));

//     const total = await PatientReport.countDocuments(query);

//     res.json({
//       reports,
//       pagination: {
//         total,
//         page: Number(page),
//         pages: Math.ceil(total / limit),
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ msg: "Error fetching reports", error: err.message });
//   }
// };

// Upload or Update report
export const uploadReport = async (req, res) => {
  try {
    const { doctorName, comments, status, reportId } = req.body;
    const file = req.file;

    let fileUrl = null;
    let fileName = null;

    if (file) {
      // Upload file to Cloudinary
      const resultCloud = await cloudinary.uploader.upload(file.path, {
        folder: "reports",
        resource_type: "auto",
      });

      // Delete local file after upload (cleanup)
      fs.unlinkSync(file.path);

      fileUrl = resultCloud.secure_url;
      fileName = file.originalname;
    }

    let report;

    if (reportId) {
      // 👉 Update existing report
      report = await PatientReport.findById(reportId);
      if (!report) return res.status(404).json({ msg: "Report not found" });

      if (fileUrl) {
        report.fileUrl = fileUrl;
        report.name = fileName;
      }
      // if (doctor) report.doctor = doctor;
      if (doctorName) report.doctorName = doctorName; // manual doctor name
      if (comments) report.comments = comments;
      if (status) report.status = status;

      await report.save();
    } else {
      // 👉 Create new report
      if (!file) return res.status(400).json({ msg: "File is required" });

      report = new PatientReport({
        name: file.originalname,
        fileUrl,
        date: new Date().toISOString().split("T")[0],
        // doctor,
        doctorName, // <-- store doctor name manually
        comments,
        status: status || "Pending Review",
        uploadedBy: req.user?.id || null,
      });

      await report.save();
    }

    res.status(201).json({
      msg: reportId
        ? "Report updated successfully"
        : "Report uploaded successfully",
      report,
    });
  } catch (err) {
    console.error("Upload/Update Report Error:", err);
    res
      .status(500)
      .json({ msg: "Error uploading/updating report", error: err.message });
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
        { comments: { $regex: search, $options: "i" } },
      ];
    }

    const reports = await PatientReport.find(query)
      .populate("doctor", "name email role") // populate doctor info
      .populate("uploadedBy", "name email role") // populate uploader info
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await PatientReport.countDocuments(query);

    // Customize response
    const formatted = reports.map((r) => ({
      _id: r._id,
      name: r.name,
      fileUrl: r.fileUrl,
      date: r.date,
      doctor: r.doctor, // populated doctor (name, email, role)
      doctorName: r.doctorName, // manual doctorName
      comments: r.comments,
      status: r.status,
      uploadedBy: r.uploadedBy,
      createdAt: r.createdAt,
    }));

    res.json({
      reports: formatted,
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

// Get single report by ID
export const getReportById = async (req, res) => {
  try {
    const report = await PatientReport.findById(req.params.id)
      .populate("doctor", "name email role")
      .populate("uploadedBy", "name email role");

    if (!report) return res.status(404).json({ msg: "Report not found" });

    // Custom response including both doctor (populated) + doctorName (manual)
    const formatted = {
      _id: report._id,
      name: report.name,
      fileUrl: report.fileUrl,
      date: report.date,
      doctor: report.doctor, // populated doctor
      doctorName: report.doctorName, // manual doctor name
      comments: report.comments,
      status: report.status,
      uploadedBy: report.uploadedBy,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    };

    res.json(formatted);
  } catch (err) {
    console.error("Get Report Error:", err);
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
