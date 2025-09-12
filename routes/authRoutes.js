import express from "express";
import {
  register,
  login,
  createCompanyAdmin,
  createUserByCompanyAdmin,
  getUsersByCompanyAdmin,
  deleteUserByCompanyAdmin,
  getUserProfileById,
  forgotPassword,
  resetPasswordWithOTP,
  updateProfile,
  getUserStats,
  getPatientCountByCompanyAdmin,
} from "../controllers/authController.js";
import authenticate from "../middleware/authmiddleware.js";
import authorizeRoles from "../middleware/authorizeRolemiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/register", register);

// This is for both
router.post("/login", login);

// here you can create companyAdmin
router.post(
  "/create-admin",
  authenticate,
  authorizeRoles("superAdmin"),
  createCompanyAdmin
);

// for patient, doctor, labTech, accountant
router.post(
  "/create-user",
  upload.single("photo"),
  authenticate,
  authorizeRoles("companyAdmin"),
  createUserByCompanyAdmin
);

router.get("/getProfile", authenticate, getUsersByCompanyAdmin);
router.get("/getProfile/:id", authenticate, getUserProfileById);

router.delete(
  "/delete-user/:id",
  authenticate,
  authorizeRoles("companyAdmin"),
  deleteUserByCompanyAdmin
);

router.put("/updateProfile", upload.single("photo"), authenticate, updateProfile);

//this is for both(superAdmin and companyAdmin)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password-otp", resetPasswordWithOTP);

router.get("/stats", authenticate, authorizeRoles("superAdmin"), getUserStats);
router.get(
  "/patients",
  authenticate,
  authorizeRoles("superAdmin"),
  getPatientCountByCompanyAdmin
);

export default router;
