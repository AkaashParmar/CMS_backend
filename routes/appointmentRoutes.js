import express from "express";
import {
  createAppointment,
  getPatientsAndDoctors,
  getAppointments,
  getAppointmentsByDoctor,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAppointmentsCount,
  getAppointmentStatusCounts,
  getUpcomingAppointments,
} from "../controllers/appointmentController.js";
import authenticate from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/create", authenticate, createAppointment);
router.get("/patients-doctors", authenticate, getPatientsAndDoctors);
router.get("/getAll", authenticate, getAppointments);
router.get("/doctor/:doctorId", authenticate, getAppointmentsByDoctor);
router.get("/count", authenticate, getAppointmentsCount);
router.get("/status/counts", authenticate, getAppointmentStatusCounts);
router.get("/:id", authenticate, getAppointmentById);
router.put("/:id", authenticate, updateAppointment);
router.delete("/:id", authenticate, deleteAppointment);
router.get("/upcoming/:patientId", authenticate, getUpcomingAppointments);

export default router;
