import express from "express";
import {
  register,
  login,
  createCompanyAdmin,
  createUserByCompanyAdmin,
  forgotPassword,
  updateProfile,
} from "../controllers/authController.js";
import authenticate from "../middleware/authmiddleware.js";
import authorizeRoles from "../middleware/authorizeRolemiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/register", register);

//This is for both
router.post("/login", login);

//here you can create companyAdmin
router.post(
  "/create-admin",
  authenticate,
  authorizeRoles("superAdmin"),
  createCompanyAdmin
);

router.post(
  "/create-user",
  upload.single("photo"),
  authenticate,
  authorizeRoles(["companyAdmin", "doctor"]),
  createUserByCompanyAdmin
);

router.put("/updateProfile", authenticate, updateProfile);

//this is for both(superAdmin and companyAdmin)
router.post("/forgot-password", forgotPassword);

export default router;
