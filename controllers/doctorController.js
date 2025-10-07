import mongoose from "mongoose";
import User from "../models/User.js";

export const addHolidayForAllDoctors = async (req, res) => {
    try {
        const { companyAdminId } = req.params;
        const { date, reason } = req.body;

        if (!date) {
            return res.status(400).json({ success: false, message: "Date is required" });
        }

        // all doctors created by this companyAdmin
        const doctors = await User.find({
            role: "doctor",
            createdBy: new mongoose.Types.ObjectId(companyAdminId),
        });

        if (!doctors.length) {
            return res.status(404).json({ success: false, message: "No doctors found for this companyAdmin" });
        }

        const updatedDoctors = await Promise.all(
            doctors.map(async (doctor) => {
                if (!doctor.profile.holidays) doctor.profile.holidays = [];
                doctor.profile.holidays.push({ date, reason });
                await doctor.save();
                return doctor;
            })
        );

        res.json({
            success: true,
            message: `Holiday added for ${updatedDoctors.length} doctors`,
            holidays: updatedDoctors.map(d => ({
                doctorId: d._id,
                holidays: d.profile.holidays
            }))
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};


// Get holidays for all doctors under a companyAdmin
export const getAllDoctorsHolidays = async (req, res) => {
    try {
        const { companyAdminId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(companyAdminId)) {
            return res.status(400).json({ success: false, message: "Invalid Company Admin ID" });
        }

        // Find all doctors created by this companyAdmin
        const doctors = await User.find({
            role: "doctor",
            createdBy: new mongoose.Types.ObjectId(companyAdminId),
        });

        if (!doctors || doctors.length === 0) {
            return res.status(404).json({ success: false, message: "No doctors found for this companyAdmin" });
        }

        // Map the result to include holidays from profile
        const result = doctors.map(d => ({
            doctorId: d._id,
            name: d.name,
            holidays: d.profile?.holidays || [],
        }));

        res.json({ success: true, doctors: result });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

