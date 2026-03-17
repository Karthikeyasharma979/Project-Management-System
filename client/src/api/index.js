import axios from 'axios';
import jwt_decode from 'jwt-decode';
// Base URL is configurable via Vite env: VITE_API_BASE_URL
// Examples:
// VITE_API_BASE_URL=https://your-api.example.com/api/
// VITE_API_BASE_URL=http://localhost:8700/api/
// Fallback to relative '/api/' if not set
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/';
const API = axios.create({ baseURL });



//auth
export const signIn = async ({ email, password }) => await API.post('/auth/signin', { email, password });
export const signUp = async ({
    name,
    email,
    password,
    gender,
}) => await API.post('/auth/signup', {
    name,
    email,
    password,
    gender,
});
export const googleSignIn = async ({
    name,
    email,
    img,
}) => await API.post('/auth/google', {
    name,
    email,
    img,
}, { withCredentials: true });
export const findUserByEmail = async (email) => await API.get(`/auth/findbyemail?email=${email}`);
export const generateOtp = async (email, name, reason) => await API.get(`/auth/generateotp?email=${email}&name=${name}&reason=${reason}&_=${Date.now()}`);
export const verifyOtp = async (otp) => await API.get(`/auth/verifyotp?code=${otp}`);
export const resetPassword = async (email, password) => await API.put(`/auth/forgetpassword`, { email, password });

//user api
export const getUsers = async (token) => await API.get('/users/find', { headers: { "Authorization": `Bearer ${token}` } }, {
    withCredentials: true
});
export const updateUser = async (id, user, token) => await API.put(`/users/${id}`, user, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const deleteUser = async (id, token) => await API.delete(`/users/${id}`, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });

// Community
export const getPosts = async (token) => await API.get("/community", { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const createPost = async (data, token) => await API.post("/community", data, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const likePost = async (id, token) => await API.put(`/community/like/${id}`, {}, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const deletePost = async (id, token) => await API.delete(`/community/${id}`, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const updatePost = async (id, data, token) => await API.put(`/community/${id}`, data, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const searchUsers = async (search, token) => await API.get(`users/search/${encodeURIComponent(search)}`, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const notifications = async (token) => await API.get('/users/notifications', { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const clearNotifications = async (token) => await API.delete('/users/notifications', { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const addComment = async (data, token) => await API.post("/community/comments", data, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const getComments = async (postId, token) => await API.get(`/community/comments/${postId}`, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const getProjects = async (token) => await API.get(`/users/projects`, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const userWorks = async (token) => await API.get('/users/works', { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const userTasks = async (token) => await API.get('/users/tasks', { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });

//projects api
export const createProject = async (project, token) => await API.post('project/', project, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const getProjectDetails = async (id, token) => await API.get(`/project/${id}`, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const inviteProjectMembers = async (id, members, token) => await API.post(`/project/invite/${id}`, members, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const addWorks = async (id, works, token) => await API.post(`/project/works/${id}`, works, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const addProjectDocument = async (id, data, token) => await API.post(`/project/${id}/documents`, data, { headers: { Authorization: `Bearer ${token}` } }, { withCredentials: true });
export const deleteProjectDocument = async (id, docId, token) => await API.delete(`/project/${id}/documents/${docId}`, { headers: { Authorization: `Bearer ${token}` } }, { withCredentials: true });
export const getWorks = async (id, token) => await API.get(`/project/works/${id}`, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const verifyProjectInvite = async (code, projectid, userid, access, role) => await API.get(`/project/invite/${code}?projectid=${projectid}&userid=${userid}&access=${access}&role=${role}`, { withCredentials: true });
export const updateProject = async (id, project, token) => await API.patch(`/project/${id}`, project, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const deleteProject = async (id, token) => await API.delete(`/project/${id}`, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const updateMembers = async (id, members, token) => await API.patch(`/project/member/${id}`, members, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const removeMembers = async (id, members, token) => await API.patch(`/project/member/remove/${id}`, members, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const updateTaskStatus = async (taskId, status, token) => await API.patch(`/project/task/${taskId}`, { status }, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const updateTaskDetails = async (taskId, taskData, token) => await API.patch(`/project/task/update/${taskId}`, taskData, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const updateWorkStatus = async (workId, status, token) => await API.patch(`/project/work/${workId}`, { status }, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const deleteTask = async (taskId, token) => await API.delete(`/project/task/${taskId}`, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const addTask = async (workId, taskData, token) => await API.post(`/project/work/${workId}/task`, taskData, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const deleteWork = async (workId, token) => await API.delete(`/project/work/${workId}`, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const startTimer = async (taskId, token) => await API.post(`/project/task/${taskId}/start-timer`, {}, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const stopTimer = async (taskId, token) => await API.post(`/project/task/${taskId}/stop-timer`, {}, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const updateProjectStages = async (id, stages, token) => await API.patch(`/project/${id}/stages`, { stages }, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const getWorkloadStats = async (token) => await API.get('/project/get/workload', { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const createSnapshot = async (id, message, token) => await API.post(`/project/${id}/snapshot`, { message }, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const getSnapshots = async (id, token) => await API.get(`/project/${id}/snapshots`, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const getGitHubActivity = async (id, token) => await API.get(`/project/${id}/github`, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const warpDriveProject = async (data, token) => await API.post('/project/warp-drive', data, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const createZoomMeeting = async (projectId, token) => await API.post(`/zoom/create`, { projectId }, { headers: { "Authorization": `Bearer ${token}` }, withCredentials: true });

//teams api
export const createTeam = async (team, token) => await API.post('team/', team, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const getTeams = async (id, token) => await API.get(`/team/${id}`, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const inviteTeamMembers = async (id, members, token) => await API.post(`/team/invite/${id}`, members, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const addTeamProject = async (id, project, token) => await API.post(`/team/addProject/${id}`, project, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const verifyTeamInvite = async (code, teamid, userid, access, role) => await API.get(`/team/invite/${code}?teamid=${teamid}&userid=${userid}&access=${access}&role=${role}`, { withCredentials: true });
export const updateTeam = async (id, team, token) => await API.patch(`/team/${id}`, team, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const deleteTeam = async (id, token) => await API.delete(`/team/${id}`, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const updateTeamMembers = async (id, members, token) => await API.patch(`/team/member/${id}`, members, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const removeTeamMembers = async (id, members, token) => await API.patch(`/team/member/remove/${id}`, members, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const addPoll = async (id, poll, token) => await API.post(`/team/${id}/polls`, poll, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const votePoll = async (id, pollId, optionIndex, token) => await API.patch(`/team/${id}/polls/vote`, { pollId, optionIndex }, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const deletePoll = async (id, pollId, token) => await API.patch(`/team/${id}/polls/delete`, { pollId }, { headers: { "Authorization": `Bearer ${token}` } });
export const getTeamAnalytics = async (id, token) => await API.get(`/team/${id}/analytics`, { headers: { "Authorization": `Bearer ${token}` } });
// Announcements
export const addAnnouncement = async (id, data, token) => await API.post(`/team/${id}/announcements`, data, { headers: { "Authorization": `Bearer ${token}` } });
export const deleteAnnouncement = async (id, announcementId, token) => await API.patch(`/team/${id}/announcements/delete`, { announcementId }, { headers: { "Authorization": `Bearer ${token}` } });
// Meeting Notes
export const addMeetingNote = async (id, data, token) => await API.post(`/team/${id}/meeting-notes`, data, { headers: { "Authorization": `Bearer ${token}` } });
export const deleteMeetingNote = async (id, noteId, token) => await API.patch(`/team/${id}/meeting-notes/delete`, { noteId }, { headers: { "Authorization": `Bearer ${token}` } });
// Resources
export const addResource = async (id, data, token) => await API.post(`/team/${id}/resources`, data, { headers: { "Authorization": `Bearer ${token}` } });
export const deleteResource = async (id, resourceId, token) => await API.patch(`/team/${id}/resources/delete`, { resourceId }, { headers: { "Authorization": `Bearer ${token}` } });



//chat api
export const createChat = async (data, token) => await API.post('/chat/', data, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const userChats = async (id, token) => await API.get(`/chat/${id}`, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const findChat = async (firstId, secondId, token) => await API.get(`/chat/find/${firstId}/${secondId}`, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const getProjectChat = async (projectId, token) => await API.get(`/chat/project/${projectId}`, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const addMessage = async (data, token) => await API.post('/message/', data, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const getMessages = async (chatId, token) => await API.get(`/message/${chatId}`, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });

// AI Features
export const aiGenerateTask = async (taskTitle, projectId, token) => await API.post('/ai/task-assistant', { taskTitle, projectId }, { headers: { "Authorization": `Bearer ${token}` } });
export const aiSprintPlanner = async (projectId, token) => await API.post('/ai/sprint-planner', { projectId }, { headers: { "Authorization": `Bearer ${token}` } });
export const getProjectAnalytics = async (projectId, token) => await API.get(`/ai/analytics/${projectId}`, { headers: { "Authorization": `Bearer ${token}` } });

