import express from "express";
import {
  createAppointment,
  getAllAppointments,
  updateAppointmentStatus,
  deleteAppointment,
  getPatientsAndDoctors,
} from "../controllers/requestController.js";
 
const router = express.Router();

router.post("/create", createAppointment); // Patient submits form
router.get("/", getAllAppointments); // Admin dashboard
router.get("/:patientId", getPatientsAndDoctors); // Patient view
router.patch("/:id", updateAppointmentStatus); // Admin update
router.delete("/:id", deleteAppointment); // Admin delete

export default router;
