import Issue from "../models/FeedbackModel.js";
import User from "../models/User.js";

// Create new issue (Patient or Employee)
export const createIssue = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ msg: "Title and description are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const reporterName = `${user.role} - ${user.name}`;

    let createdBy = req.user.id;

    if (["doctor", "patient", "accountant", "labTechnician"].includes(user.role)) {
      createdBy = user.createdBy;
    }

    const newIssue = new Issue({
      reporter: reporterName,
      title,
      description,
      reportedBy: user._id,
      reporterType: user.role === "patient" ? "patient" : "Employee",
      createdBy,  // This controls who sees the issue later
    });

    await newIssue.save();

    res.status(201).json({ msg: "Issue reported successfully", issue: newIssue });
  } catch (err) {
    res.status(500).json({ msg: "Error creating issue", error: err.message });
  }
};

export const getIssuesForCompanyAdmin = async (req, res) => {
  try {
    const issues = await Issue.find({ createdBy: req.user.id })
      .populate("reportedBy", "name role profile.phoneNumber");

    res.status(200).json({
      msg: "Issues fetched successfully",
      issues,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};


export const getOwnIssues = async (req, res) => {
  try {
    let issues;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.role === "companyAdmin") {
      // CompanyAdmin should see all issues where createdBy === their ID
      issues = await Issue.find({ createdBy: req.user.id });
    } else {
      // Other roles (doctor, patient, labTechnician, accountant) should see only their own reported issues
      issues = await Issue.find({ reportedBy: req.user.id });
    }

    res.status(200).json({
      msg: "Your reported issues fetched successfully",
      issues,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
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

export const getFilteredIssues = async (req, res) => {
  try {
    const { status, search, reporterType, page = 1, limit = 10 } = req.query;
    const query = {};

    const userId = req.user.id;
    const userRole = req.user.role;

    if (!["superAdmin", "companyAdmin"].includes(userRole)) {
      return res.status(403).json({ msg: "Only superAdmin or companyAdmin can view issues" });
    }

    // If companyAdmin, restrict to their own issues
    if (userRole === "companyAdmin") {
      query.createdBy = userId;
    }

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
      .limit(Number(limit))
      .populate('createdBy', 'name email role');  // helpful info

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

export const createFeedback = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!["superAdmin", "companyAdmin"].includes(req.user.role)) {
      return res.status(403).json({ msg: "Only superAdmin or companyAdmin can create feedback" });
    }

    const feedback = new Issue({
      title,
      description,
      createdBy: req.user.id,
    });

    await feedback.save();

    res.status(201).json({ msg: "Feedback created successfully", issue: feedback });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};


// export const getAllFeedback = async (req, res) => {
//   try {
//     if (!["superAdmin", "companyAdmin"].includes(req.user.role)) {
//       return res.status(403).json({ msg: "Only superAdmin or companyAdmin can view feedback" });
//     }

//     const feedback = await Issue.find().populate('createdBy', 'name email role');

//     res.json({ issues: feedback });
//   } catch (error) {
//     res.status(500).json({ msg: "Server Error", error: error.message });
//   }
// };


export const resolveFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { solution } = req.body;

    if (!solution || solution.trim() === "") {
      return res.status(400).json({ msg: "Solution is required to resolve the issue." });
    }

    const issue = await Issue.findById(id);
    if (!issue) return res.status(404).json({ msg: "Issue not found." });

    if (req.user.role !== 'superAdmin') {
      return res.status(403).json({ msg: "Only superAdmin can resolve issues." });
    }

    issue.status = 'Resolved'; // <-- use the valid enum value
    issue.solution = solution;
    await issue.save();

    res.json({ msg: "Issue resolved successfully.", issue });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};
