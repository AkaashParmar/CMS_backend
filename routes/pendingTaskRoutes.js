import express from "express";
import { getPendingTasks, addPendingTask, updatePendingTask } from "../controllers/pendingTaskController.js";
import authenticate from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/get", authenticate, getPendingTasks);
router.post("/", authenticate, addPendingTask);
router.patch("/:id/complete", authenticate, updatePendingTask);

export default router;
