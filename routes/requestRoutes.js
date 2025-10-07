import express from "express";
import {
  createRequest,
  getAllRequests,
  updateRequest,
  deleteRequest,
  getRequestsByPatient,
} from "../controllers/requestController.js";

const router = express.Router();

router.post("/create", createRequest); // Patient submits form
router.get("/", getAllRequests); // Admin dashboard
router.get("/:patientId", getRequestsByPatient); // Patient view
router.patch("/:id", updateRequest); // Admin update
router.delete("/:id", deleteRequest); // Admin delete

export default router;
