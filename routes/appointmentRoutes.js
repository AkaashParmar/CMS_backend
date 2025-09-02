import express from "express";
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAppointmentsCount,
  getAppointmentStatusCounts,
} from "../controllers/appointmentController.js";
import authenticate from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/create", authenticate, createAppointment);
router.get("/getAll", authenticate, getAppointments);
router.get("/count", authenticate, getAppointmentsCount);
router.get("/status/counts", authenticate, getAppointmentStatusCounts);
router.get("/:id", authenticate, getAppointmentById);
router.put("/:id", authenticate, updateAppointment);
router.delete("/:id", authenticate, deleteAppointment);

export default router;
