import express from "express";
import {
  register,
  login,
  createCompanyAdmin,
} from "../controllers/authController.js";
import authenticate from "../middleware/authmiddleware.js";
import authorizeRoles from "../middleware/authorizeRolemiddleware.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post(
  "/create-admin",
  authenticate,
  authorizeRoles("superAdmin"),
  createCompanyAdmin
);

export default router;
