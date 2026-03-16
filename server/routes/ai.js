import express from "express";
import { aiTaskAssistant, aiSprintPlanner, getProjectAnalytics } from "../controllers/ai.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// AI Task Assistant: generate task details from a title
router.post("/task-assistant", verifyToken, aiTaskAssistant);

// AI Sprint Planner: generate sprint plan for a project
router.post("/sprint-planner", verifyToken, aiSprintPlanner);

// Project Analytics: burndown, velocity, member stats
router.get("/analytics/:projectId", verifyToken, getProjectAnalytics);

export default router;
