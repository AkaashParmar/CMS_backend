import express from "express";
import {
  createClinic,
  getClinics,
  getClinicById,
  updateClinic,
  deleteClinic,
  getEmployeeCountPerClinic,
} from "../controllers/clinicController.js";
import authenticate from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/create", authenticate, createClinic);
router.get("/allClinics", authenticate, getClinics);
router.get("/single/:id", authenticate, getClinicById);
router.get("/employeeCount", authenticate, getEmployeeCountPerClinic);
router.put("/update/:id", authenticate, updateClinic);
router.delete("/delete/:id", authenticate, deleteClinic);


export default router;
