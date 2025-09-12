import User from "../models/User.js";
import Progress from "../models/Progress.js";
import PatientReport from "../models/Report.js";
import mongoose from "mongoose";

export const getPatientProgress = async (req, res) => {
  try {
    // Step 1: Fetch all users with role 'patient'
    const patients = await User.find({ role: 'patient' });

    // Step 2: For each patient, collect their progress and reports
    const progressData = await Promise.all(
      patients.map(async (patient) => {
        const reports = await PatientReport.find({ uploadedBy: patient._id });

        const progresses = await Progress.find({ patient: patient._id })
          .sort({ recordedAt: -1 });  // Latest first

        const latestProgress = progresses[0];  // Latest progress entry

        return {
          name: patient.name,
          status: latestProgress ? latestProgress.status : 'No Data',
          progress: latestProgress ? `${latestProgress.progressPercentage}%` : 'N/A',
          lastVisit: reports.length > 0
            ? reports[reports.length - 1].date
            : 'N/A',
        };
      })
    );

    res.json(progressData);
  } catch (error) {
    console.error('Error fetching patient progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMonthlyRecoveryProgress = async (req, res) => {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const data = await Progress.aggregate([
      { $match: { recordedAt: { $gte: oneYearAgo } } },
      {
        $group: {
          _id: { year: { $year: "$recordedAt" }, month: { $month: "$recordedAt" } },
          averageProgress: { $avg: "$progressPercentage" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const formattedData = data.map((d) => ({
      month: `${d._id.year}-${String(d._id.month).padStart(2, '0')}`,
      averageProgress: Math.round(d.averageProgress),
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching monthly recovery progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getActivityBreakdown = async (req, res) => {
  try {
    const data = await PatientReport.aggregate([
      {
        $group: {
          _id: "$type", 
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedData = data.map((d) => ({
      type: d._id,
      count: d.count,
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching activity breakdown:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
