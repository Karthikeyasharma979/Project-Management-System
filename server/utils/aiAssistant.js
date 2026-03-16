import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generate an AI-powered task description, subtasks, and estimated hours
 * from a short task title.
 */
export const generateTaskDetails = async (taskTitle, projectContext = "") => {
    const systemInstruction = `You are an expert software project manager and technical lead.
Given a short task title (and optional project context), generate:
1. A clear, concise task description (2-3 sentences, actionable, professional)
2. A list of 2-4 concrete subtasks that break the work into steps
3. An estimated time in hours (realistic, based on typical software dev effort)
4. A priority level (Low, Medium, High, Critical)
Keep everything professional and technical. Focus on software development context.`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            description: {
                type: Type.STRING,
                description: "A clear, concise 2-3 sentence description of what this task involves and why it matters."
            },
            subtasks: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "2-4 concrete, actionable subtask steps that need to be completed."
            },
            estimatedHours: {
                type: Type.NUMBER,
                description: "Realistic estimated hours to complete this task (integer between 1-40)."
            },
            priority: {
                type: Type.STRING,
                description: "Task priority: one of Low, Medium, High, Critical."
            },
            tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "2-3 relevant technical tags (e.g., Frontend, API, Testing, Database)."
            }
        },
        required: ["description", "subtasks", "estimatedHours", "priority", "tags"]
    };

    const prompt = projectContext
        ? `Task Title: "${taskTitle}"\nProject Context: ${projectContext}`
        : `Task Title: "${taskTitle}"`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("AI Task Assistant Error:", error);
        throw new Error("Failed to generate task details via AI.");
    }
};

/**
 * Generate an AI Sprint Plan based on project goals, deadline, and team size.
 */
export const generateSprintPlan = async ({ projectTitle, projectDesc, deadline, teamSize, existingTasks = [] }) => {
    const systemInstruction = `You are an expert Agile coach and software project manager.
Given project details, generate a practical sprint plan with 2-3 sprints.
Each sprint should have a clear goal, duration (in weeks), and 3-5 key focus areas/tasks.
Be specific, realistic, and focused on software delivery milestones.`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            sprints: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        goal: { type: Type.STRING },
                        durationWeeks: { type: Type.NUMBER },
                        focusAreas: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        deliverables: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["name", "goal", "durationWeeks", "focusAreas", "deliverables"]
                }
            },
            recommendation: {
                type: Type.STRING,
                description: "Overall strategic recommendation for successfully completing this project."
            }
        },
        required: ["sprints", "recommendation"]
    };

    const daysLeft = deadline
        ? Math.max(1, Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)))
        : 90;

    const prompt = `Project: "${projectTitle}"
Description: ${projectDesc}
Deadline: ${deadline || "Not set"} (${daysLeft} days from now)
Team Size: ${teamSize} people
Existing Tasks: ${existingTasks.length > 0 ? existingTasks.map(t => t.task).join(", ") : "None yet"}

Generate a sprint plan that fits within the deadline.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("AI Sprint Planner Error:", error);
        throw new Error("Failed to generate sprint plan via AI.");
    }
};
