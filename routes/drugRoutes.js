import express from "express";
import {
  createDrug,
  getDrugs,
  // getDrugById,
  updateDrug,
  deleteDrug,
} from "../controllers/drugController.js";
import authenticate from "../middleware/authmiddleware.js";
import authorizeRoles from "../middleware/authorizeRolemiddleware.js";

const router = express.Router();

router.post("/add", authenticate, createDrug);
router.get("/alldrug", authenticate, getDrugs);
// router.get("/:id", authenticate, getDrugById);
router.put("/:id", authenticate, updateDrug);
router.delete("/:id", authenticate, deleteDrug);

export default router;
