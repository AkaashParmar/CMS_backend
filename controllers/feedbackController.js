import Issue from "../models/FeedbackModel.js";
import User from "../models/User.js";

// Create new issue (Patient or Employee)
export const createIssue = async (req, res) => {
  try {
    const { title, description, reporterType } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ msg: "Title and description are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const reporterName = `${user.role} - ${user.name}`;

    const newIssue = new Issue({
      reporter: reporterName,
      title,
      description,
      reportedBy: user._id,
      reporterType: user.role === "patient" ? "patient" : "Employee",
    });

    await newIssue.save();

    res
      .status(201)
      .json({ msg: "Issue reported successfully", issue: newIssue });
  } catch (err) {
    res.status(500).json({ msg: "Error creating issue", error: err.message });
  }
};

// Get all issues
export const getIssues = async (req, res) => {
  try {
    const { status, search, reporterType, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (reporterType) query.reporterType = reporterType;
    if (search) {
      query.$or = [
        { reporter: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
      ];
    }

    const issues = await Issue.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Issue.countDocuments(query);

    res.json({
      issues,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching issues", error: err.message });
  }
};

// Get single issue
export const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ msg: "Issue not found" });
    res.json(issue);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching issue", error: err.message });
  }
};

// Update issue (Admin updates status/solution)
export const updateIssue = async (req, res) => {
  try {
    const { status, solution } = req.body;

    const updated = await Issue.findByIdAndUpdate(
      req.params.id,
      { status, solution },
      { new: true }
    );

    if (!updated) return res.status(404).json({ msg: "Issue not found" });

    res.json({ msg: "Issue updated successfully", issue: updated });
  } catch (err) {
    res.status(500).json({ msg: "Error updating issue", error: err.message });
  }
};

// Delete issue
export const deleteIssue = async (req, res) => {
  try {
    const deleted = await Issue.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Issue not found" });
    res.json({ msg: "Issue deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting issue", error: err.message });
  }
};
