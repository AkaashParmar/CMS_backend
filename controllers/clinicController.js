import Clinic from "../models/Clinic.js";

export const createClinic = async (req, res) => {
  try {
    const clinic = new Clinic({
      ...req.body,
      createdBy: req.user.id,  
    });

    await clinic.save();
    res.status(201).json({ message: "Clinic created successfully", clinic });
  } catch (error) {
    res.status(400).json({ message: "Error creating clinic", error: error.message });
  }
};


// Get all clinics
export const getClinics = async (req, res) => {
  try {
    const clinics = await Clinic.find().populate("primaryDoctor associatedDoctors panelDoctors");
    res.status(200).json(clinics);
  } catch (error) {
    res.status(500).json({ message: "Error fetching clinics", error: error.message });
  }
};

// Get single clinic
export const getClinicById = async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id).populate("primaryDoctor associatedDoctors panelDoctors");
    if (!clinic) return res.status(404).json({ message: "Clinic not found" });
    res.status(200).json(clinic);
  } catch (error) {
    res.status(500).json({ message: "Error fetching clinic", error: error.message });
  }
};

// Update clinic
export const updateClinic = async (req, res) => {
  try {
    const clinic = await Clinic.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!clinic) return res.status(404).json({ message: "Clinic not found" });
    res.status(200).json({ message: "Clinic updated successfully", clinic });
  } catch (error) {
    res.status(400).json({ message: "Error updating clinic", error: error.message });
  }
};

// Delete clinic
export const deleteClinic = async (req, res) => {
  try {
    const clinic = await Clinic.findByIdAndDelete(req.params.id);
    if (!clinic) return res.status(404).json({ message: "Clinic not found" });
    res.status(200).json({ message: "Clinic deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting clinic", error: error.message });
  }
};

//emplyee stats (companyAdmin Report)
export const getEmployeeCountPerClinic = async (req, res) => {
  try {

    const clinics = await Clinic.aggregate([
      {
        $project: {
          clinicName: 1,
          employeeIds: {
            $setUnion: [
              { $cond: [{ $ifNull: ["$primaryDoctor", false] }, ["$primaryDoctor"], []] },
              { $ifNull: ["$associatedDoctors", []] },
              { $ifNull: ["$panelDoctors", []] },
            ],
          },
        },
      },
      {
        $project: {
          clinicName: 1,
          employeeCount: { $size: "$employeeIds" },
        },
      },
    ]);

    return res.status(200).json({ success: true, data: clinics });
  } catch (error) {
    console.error("Error fetching employee count per clinic:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

