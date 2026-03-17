import { createError } from "../error.js";
import Project from "../models/Project.js";
import Works from "../models/Works.js";
import Tasks from "../models/Tasks.js";
import { generateTaskDetails, generateSprintPlan } from "../utils/aiAssistant.js";

/**
 * POST /api/ai/task-assistant
 * Body: { taskTitle, projectId }
 * Returns: AI-generated task description, subtasks, estimatedHours, priority, tags
 */
export const aiTaskAssistant = async (req, res, next) => {
    const { taskTitle, projectId } = req.body;
    if (!taskTitle || !taskTitle.trim()) {
        return next(createError(400, "Task title is required."));
    }

    try {
        let projectContext = "";
        if (projectId) {
            const project = await Project.findById(projectId).select("title desc tags");
            if (project) {
                projectContext = `Project: ${project.title}. ${project.desc}. Tech stack: ${project.tags?.join(", ") || "General"}`;
            }
        }

        const result = await generateTaskDetails(taskTitle.trim(), projectContext);
        res.status(200).json(result);
    } catch (err) {
        console.error("AI Task Assistant error:", err);
        next(createError(500, "AI service temporarily unavailable. Please try again."));
    }
};

/**
 * POST /api/ai/sprint-planner
 * Body: { projectId }
 * Returns: AI sprint plan for the project
 */
export const aiSprintPlanner = async (req, res, next) => {
    const { projectId } = req.body;
    if (!projectId) {
        return next(createError(400, "Project ID is required."));
    }

    try {
        const project = await Project.findById(projectId).populate("members.id", "name");
        if (!project) return next(createError(404, "Project not found."));

        // Check if requester is a member
        const isMember = project.members.some(m => m.id?._id?.toString() === req.user.id || m.id?.toString() === req.user.id);
        if (!isMember) return next(createError(403, "You must be a project member to use AI Sprint Planner."));

        // Fetch all tasks for context
        const works = await Works.find({ projectId }).populate("tasks");
        const allTasks = works.flatMap(w => w.tasks || []);

        const result = await generateSprintPlan({
            projectTitle: project.title,
            projectDesc: project.desc,
            deadline: project.deadline || null,
            teamSize: project.members.length,
            existingTasks: allTasks
        });

        res.status(200).json(result);
    } catch (err) {
        console.error("AI Sprint Planner error:", err);
        next(createError(500, "AI service temporarily unavailable. Please try again."));
    }
};

/**
 * GET /api/ai/analytics/:projectId
 * Returns comprehensive burndown data, velocity, completion rates, member stats
 */
export const getProjectAnalytics = async (req, res, next) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId).populate("members.id", "name img email");
        if (!project) return next(createError(404, "Project not found."));

        const isMember = project.members.some(m =>
            (m.id?._id?.toString() || m.id?.toString()) === req.user.id
        );
        if (!isMember) return next(createError(403, "Not authorized."));

        // Fetch all works and tasks for this project
        const works = await Works.find({ projectId }).populate({
            path: "tasks",
            populate: { path: "members", select: "name img email" }
        });

        const allTasks = works.flatMap(w => w.tasks || []);
        const totalTasks = allTasks.length;
        const completedTasks = allTasks.filter(t => t.status === "Completed");
        const cancelledTasks = allTasks.filter(t => t.status === "Cancelled");
        const activeTasks = allTasks.filter(t => t.status !== "Completed" && t.status !== "Cancelled");

        // ─── Burndown Data ───────────────────────────────────────────────
        // Generate last 14 days of data
        const burndownData = [];
        const today = new Date();
        for (let i = 13; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            date.setHours(23, 59, 59, 999);

            const completedByDate = allTasks.filter(t => {
                if (t.status !== "Completed" && t.status !== "Cancelled") return false;
                return new Date(t.updatedAt) <= date;
            }).length;

            const remaining = totalTasks - completedByDate;
            burndownData.push({
                date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                remaining: Math.max(0, remaining),
                completed: completedByDate,
                ideal: Math.max(0, Math.round(totalTasks * (i / 14)))
            });
        }

        // ─── Task Status Distribution ────────────────────────────────────
        const statusDist = {};
        allTasks.forEach(t => {
            statusDist[t.status] = (statusDist[t.status] || 0) + 1;
        });

        // ─── Work Status Distribution ────────────────────────────────────
        const workStatusDist = {};
        works.forEach(w => {
            workStatusDist[w.status] = (workStatusDist[w.status] || 0) + 1;
        });

        // ─── Member Performance Stats ────────────────────────────────────
        const memberMap = new Map();
        project.members.forEach(m => {
            const id = (m.id?._id || m.id)?.toString();
            if (id && !memberMap.has(id)) {
                memberMap.set(id, {
                    id,
                    name: m.id?.name || "Unknown",
                    img: m.id?.img || "",
                    role: m.access,
                    assigned: 0,
                    completed: 0,
                    active: 0,
                    timeTracked: 0
                });
            }
        });

        allTasks.forEach(task => {
            (task.members || []).forEach(member => {
                const mId = (member._id || member)?.toString();
                if (memberMap.has(mId)) {
                    const stats = memberMap.get(mId);
                    stats.assigned++;
                    if (task.status === "Completed") stats.completed++;
                    else if (task.status !== "Cancelled") stats.active++;
                    stats.timeTracked += task.time_tracked || 0;
                }
            });
        });

        // ─── Time Tracking Summary ───────────────────────────────────────
        const totalTimeTracked = allTasks.reduce((sum, t) => sum + (t.time_tracked || 0), 0);

        // ─── Weekly Activity (last 7 days created tasks) ─────────────────
        const weeklyActivity = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayStr = date.toLocaleDateString("en-US", { weekday: "short" });
            const created = allTasks.filter(t => {
                const d = new Date(t.createdAt);
                return d.getDate() === date.getDate() &&
                    d.getMonth() === date.getMonth() &&
                    d.getFullYear() === date.getFullYear();
            }).length;
            const completed = allTasks.filter(t => {
                if (t.status !== "Completed") return false;
                const d = new Date(t.updatedAt);
                return d.getDate() === date.getDate() &&
                    d.getMonth() === date.getMonth() &&
                    d.getFullYear() === date.getFullYear();
            }).length;
            weeklyActivity.push({ day: dayStr, created, completed });
        }

        // ─── Health Score ─────────────────────────────────────────────────
        const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
        const activityScore = weeklyActivity.reduce((sum, d) => sum + d.completed, 0);
        const healthScore = Math.min(100, Math.round(completionRate * 0.6 + Math.min(activityScore * 5, 40)));

        res.status(200).json({
            overview: {
                totalTasks,
                completedTasks: completedTasks.length,
                activeTasks: activeTasks.length,
                cancelledTasks: cancelledTasks.length,
                totalWorks: works.length,
                completionRate: Math.round(completionRate),
                totalTimeTracked: Math.round(totalTimeTracked),
                healthScore,
            },
            burndownData,
            weeklyActivity,
            statusDistribution: Object.entries(statusDist).map(([name, value]) => ({ name, value })),
            workStatusDistribution: Object.entries(workStatusDist).map(([name, value]) => ({ name, value })),
            memberStats: Array.from(memberMap.values())
                .filter(m => m.assigned > 0 || m.role === "Owner")
                .sort((a, b) => b.completed - a.completed),
        });
    } catch (err) {
        console.error("Analytics error:", err);
        next(err);
    }
};
