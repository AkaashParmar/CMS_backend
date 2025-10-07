import DoctorSurvey from "../models/DoctorSurvey.js";

// ✅ POST /api/doctor-performance/survey
export const saveDoctorSurvey = async (req, res) => {
  try {
    const { doctorName, responses } = req.body;

    if (!doctorName || !responses || !Array.isArray(responses)) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

    const score = (
      (responses.reduce((a, b) => a + b, 0) / responses.length) *
      2
    ).toFixed(1);

    const survey = new DoctorSurvey({ doctorName, responses, score });
    await survey.save();

    res.json({ success: true, message: "Survey saved successfully" });
  } catch (err) {
    console.error("Error saving survey:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ GET /api/doctor-performance/scores
export const getDoctorPerformance = async (req, res) => {
  try {
    const data = await DoctorSurvey.aggregate([
      {
        $group: {
          _id: "$doctorName",
          avgScore: { $avg: "$score" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          doctorName: "$_id",
          avgScore: { $round: ["$avgScore", 1] },
          count: 1,
          _id: 0,
        },
      },
      { $sort: { avgScore: -1 } },
    ]);

    res.json({ success: true, data });
  } catch (err) {
    console.error("Error fetching doctor performance:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
