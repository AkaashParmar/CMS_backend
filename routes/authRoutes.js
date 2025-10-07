import express from "express";
import {
  register,
  login,
  createCompanyAdmin,
  updateCompanyAdmin,
  getCompanyAdmins,
  getCompanyAdminById,
  createUserByCompanyAdmin,
  getUsersByCompanyAdmin,
  getEmployeeCountsByCompanyAdmin,
  getUserCountsPerCompanyAdmin,
  getCompanyName,
  getPatientsInDoctor,
  getDoctorsByCompanyAdminId,
  deleteUserByCompanyAdmin,
  getUserProfileById,
  forgotPassword,
  resetPasswordWithOTP,
  updateProfile,
  getUserStats,
  getPatientsForCompanyAdmin,
  getCompanyAdminRevenue,
  getMonthlyLoginStats,
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
  upload.single("photo"),
  authenticate,
  authorizeRoles("superAdmin"),
  createCompanyAdmin
);

router.put(
  "/update-admin/:id",
  upload.single("photo"),
  authenticate,
  authorizeRoles("superAdmin"),
  updateCompanyAdmin
);

router.get("/get-admins", authenticate, authorizeRoles("superAdmin"), getCompanyAdmins);

router.get(
  "/get-admins/:id",
  authenticate,
  authorizeRoles("superAdmin"),
  getCompanyAdminById
);

// for patient, doctor, labTech, accountant
router.post(
  "/create-user",
  upload.single("photo"),
  authenticate,
  authorizeRoles("companyAdmin"),
  createUserByCompanyAdmin
);

router.get("/getEmployee/:companyAdminId", authenticate, getEmployeeCountsByCompanyAdmin);
router.get(
  "/company-admins",
  authenticate,
  getCompanyName
);

router.get("/company-admin/user-counts", getUserCountsPerCompanyAdmin);


router.get("/getProfile", authenticate, getUsersByCompanyAdmin);
router.get("/getProfile/:id", authenticate, getUserProfileById);

router.get("/getPatients", authenticate, getPatientsInDoctor);
router.get("/doctors/:companyAdminId", authenticate, getDoctorsByCompanyAdminId);


router.delete(
  "/delete-user/:id",
  authenticate,
  authorizeRoles("companyAdmin"),        
  deleteUserByCompanyAdmin
);

router.put("/updateProfile/:id", upload.single("photo"), authenticate, updateProfile);

//this is for both(superAdmin and companyAdmin)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password-otp", resetPasswordWithOTP);

router.get("/stats", authenticate, authorizeRoles("superAdmin"), getUserStats);
router.get(
  "/patients",
  authenticate,
  getPatientsForCompanyAdmin
);
router.get(
  "/revenue",
  authenticate,
  getCompanyAdminRevenue
);

router.get(
  "/monthly-logins",
  authenticate,
  getMonthlyLoginStats
);

export default router;
