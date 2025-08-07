import express from "express";
import {
  register,
  login,
  createCompanyAdmin,
  forgotPassword,
} from "../controllers/authController.js";
import authenticate from "../middleware/authmiddleware.js";
import authorizeRoles from "../middleware/authorizeRolemiddleware.js";

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

//this is for both(superAdmin and companyAdmin)
router.post("/forgot-password", forgotPassword);

export default router;
