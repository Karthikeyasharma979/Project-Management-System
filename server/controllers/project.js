import mongoose from "mongoose";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import { createError } from "../error.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from 'dotenv';
import Project from "../models/Project.js";
import Works from "../models/Works.js";
import Tasks from "../models/Tasks.js";
import Notifications from "../models/Notifications.js";
import otpGenerator from 'otp-generator';
import Organization from "../models/Organization.js";
import { logoSVG } from "../utils/logo.js";
import ProjectSnapshot from "../models/ProjectSnapshot.js";
import { analyzeTaskImpact } from "../utils/aiImpactAnalyzer.js";
import { generateProjectScaffold } from "../utils/warpDrive.js";


export const addProject = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(createError(404, "User not found"));
  }
  // if (!user.currentOrganization) {
  //   return next(createError(400, "Please select an organization first"));
  // }

  const newProject = new Project({
    members: [{ id: user.id, img: user.img, email: user.email, name: user.name, role: "d", access: "Owner" }],
    organizationId: user.currentOrganization,
    ...req.body
  });

  try {
    const saveProject = await newProject.save();
    await User.findByIdAndUpdate(user.id, { $push: { projects: saveProject._id } }, { new: true });
    // Also push to Organization
    if (user.currentOrganization) {
      await Organization.findByIdAndUpdate(user.currentOrganization, { $push: { projects: saveProject._id } });
    }

    res.status(200).json(saveProject);
  } catch (err) {
    next(err);
  }
};


export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(createError(404, "Project not found!"));

    const userInProject = project.members.find(m => m.id.toString() === req.user.id);
    if (!userInProject || userInProject.access !== "Owner") {
      return next(createError(403, "Only the project owner can delete this project!"));
    }

    // 1. Find all associated works
    const works = await Works.find({ projectId: project._id });
    const workIds = works.map(w => w._id);

    // 2. Find all associated tasks
    const tasks = await Tasks.find({
      $or: [
        { projectId: project._id },
        { workId: { $in: workIds } }
      ]
    });
    const taskIds = tasks.map(t => t._id);

    // 3. Find all project members for cleanup
    const memberIds = project.members.map(m => m.id);

    // 4. Update all members to remove references
    await User.updateMany(
      { _id: { $in: memberIds } },
      {
        $pull: {
          projects: project._id,
          works: { $in: workIds },
          tasks: { $in: taskIds }
        }
      }
    );

    // 5. Delete actual documents
    await Tasks.deleteMany({ _id: { $in: taskIds } });
    await Works.deleteMany({ _id: { $in: workIds } });
    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json("Project and all associated content deleted successfully.");

  } catch (err) {
    next(err);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate("members.id", "_id  name email img");
    console.log("PROJECT MEMBERS: ", JSON.stringify(project.members));
    console.log("REQ USER ID: ", req.user.id);
    var verified = false
    await Promise.all(
      project.members.map(async (Member) => {
        const memberIdStr = Member.id?._id ? Member.id._id.toString() : Member.id?.toString();
        if (memberIdStr === req.user.id) {
          verified = true
        }
      })
    )
      .then(() => {
        if (verified) {
          return res.status(200).json(project);
        } else {
          return next(createError(403, "You are not allowed to view this project!"));
        }
      });

  } catch (err) {
    next(err);
  }
};


export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(createError(404, "project not found!"));

    let userAccess = null;
    let isMember = false;
    for (let i = 0; i < project.members.length; i++) {
      if (project.members[i].id.toString() === req.user.id.toString()) {
        isMember = true;
        userAccess = project.members[i].access;
        break;
      }
    }

    if (!isMember) {
      return next(createError(403, "You can update only if you are a member of this project!"));
    }

    // Check if the update contains anything OTHER than 'ideas'
    const updateKeys = Object.keys(req.body);
    const isOnlyIdeaUpdate = updateKeys.length === 1 && updateKeys[0] === 'ideas';

    // If it's a general update, restrict by role
    if (!isOnlyIdeaUpdate) {
      if (userAccess !== "Owner" && userAccess !== "Admin" && userAccess !== "Editor") {
        return next(createError(403, "You are not allowed to update this project's details!"));
      }
    }

    const updatedproject = await Project.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json({ message: "Project has been updated...", project: updatedproject });

  } catch (err) {
    next(err);
  }
};

export const addProjectDocument = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(createError(404, "Project not found!"));

    const userInProject = project.members.find(m => m.id.toString() === req.user.id);
    if (!userInProject || !["Owner", "Admin", "Editor"].includes(userInProject.access)) {
      return next(createError(403, "You are not allowed to add documents to this project!"));
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { $push: { documents: req.body } },
      { new: true }
    );

    res.status(200).json({ message: "Document added successfully.", project: updatedProject });
  } catch (err) {
    next(err);
  }
};

export const deleteProjectDocument = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(createError(404, "Project not found!"));

    const userInProject = project.members.find(m => m.id.toString() === req.user.id);
    if (!userInProject || !["Owner", "Admin", "Editor"].includes(userInProject.access)) {
      return next(createError(403, "You do not have permission to delete documents!"));
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { $pull: { documents: { _id: req.params.docId } } },
      { new: true }
    );

    res.status(200).json({ message: "Document deleted successfully.", project: updatedProject });
  } catch (err) {
    next(err);
  }
};



export const updateMembers = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(createError(404, "project not found!"));
    for (let i = 0; i < project.members.length; i++) {
      if (project.members[i].id.toString() === req.user.id.toString()) {
        if (project.members[i].access === "Owner" || project.members[i].access === "Admin" || project.members[i].access === "Editor") {
          //update single member inside members array
          const updatedproject = await Project.findByIdAndUpdate(
            req.params.id,
            {
              $set: {
                "members.$[elem].access": req.body.access,
                "members.$[elem].role": req.body.role,
              },
            },
            {
              arrayFilters: [{ "elem.id": req.body.id }],
              new: true,
            }
          );
          res.status(200).json({ message: "Member has been updated..." });
        } else {
          return next(createError(403, "You are not allowed to update this project!"));
        }
      }
    }
    return next(createError(403, "You can update only if you are a member of this project!"));

  } catch (err) {
    next(err);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(createError(404, "project not found!"));
    for (let i = 0; i < project.members.length; i++) {
      if (project.members[i].id.toString() === req.user.id.toString()) {
        if (project.members[i].access === "Owner" || project.members[i].access === "Admin" || project.members[i].access === "Editor") {

          await Project.findByIdAndUpdate(
            req.params.id,
            {
              $pull: {
                //remove the meber with the id
                members: { id: req.body.id }
              }
            },
            {
              new: true,
            }
          )
            .exec();

          await User.findByIdAndUpdate(
            req.body.id,
            {
              $pull: {
                projects: req.params.id,
              }
            },
            {
              new: true,
            }
          ).exec()
            .then((user) => {
              res.status(200).json({ message: "Member has been removed..." });

            }).catch((err) => {
              console.log(err);
            })

        } else {
          return next(createError(403, "You are not allowed to update this project!"));
        }
      }
    }
    return next(createError(403, "You can update only if you are a member of this project!"));

  } catch (err) {
    next(err);
  }
};


dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  },
  port: 465,
  host: 'smtp.gmail.com'
});

export const inviteProjectMember = async (req, res, next) => {
  //send mail using nodemailer
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(createError(404, "User not found"));
  }
  const project = await Project.findById(req.params.id);
  if (!project) return next(createError(404, "Project not found!"));

  // Check if invited user exists
  const invitedUser = await User.findById(req.body.id);
  if (!invitedUser) return next(createError(404, "Invited user not found! Please ask them to register first."));

  // Check if user is already a member
  const isMember = project.members.some(m => m.id.toString() === req.body.id);
  if (isMember) return next(createError(403, "User is already a member of this project!"));

  req.app.locals.CODE = await otpGenerator.generate(8, { upperCaseAlphabets: true, specialChars: true, lowerCaseAlphabets: true, digits: true, });
  dotenv.config();
  const link = `${process.env.URL}/projects/invite/${req.app.locals.CODE}?projectid=${req.params.id}&userid=${req.body.id}&access=${req.body.access}&role=${req.body.role}`;
  const mailBody = `
  <div style="font-family: Poppins, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
    ${logoSVG}
    <div style="text-align: center; margin-bottom: 20px;">
        <img src="${invitedUser.img}" alt="${invitedUser.name}'s Avatar" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #854CE6; background-color: #fff;">
    </div>
    <h1 style="font-size: 22px; font-weight: 500; color: #854CE6; text-align: center; margin-bottom: 30px;">Invitation to Join Project</h1>
    <div style="background-color: #FFF; border: 1px solid #e5e5e5; border-radius: 5px; box-shadow: 0px 3px 6px rgba(0,0,0,0.05);">
        <div style="background-color: #854CE6; border-top-left-radius: 5px; border-top-right-radius: 5px; padding: 20px 0;">
            <h2 style="font-size: 28px; font-weight: 500; color: #FFF; text-align: center; margin-bottom: 10px;"><b>${project.title}</b></h2>
        </div>
        <div style="padding: 30px;">
            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">Hello ${req.body.name},</p>
            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">You've been invited to join a project called <b>${project.title}</b> on DevSync by <b>${user.name}</b>.</p>
            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">To accept the invitation and join the project, please click on the button below:</p>
            <div style="text-align: center; margin-bottom: 30px;">
                <a href=${link} style="background-color: #854CE6; color: #FFF; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">Accept Invitation</a>
            </div>
            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">If you have any questions or issues with joining the project, please contact  <b>${user.name}</b> for assistance.</p>
        </div>
    </div>
    <br>
    <p style="font-size: 16px; color: #666; margin-top: 30px;">Best regards,</p>
    <p style="font-size: 16px; color: #666; margin-bottom: 20px; text-align: center;">The DevSync Team</p>
</div>
`

  for (let i = 0; i < project.members.length; i++) {
    if (project.members[i].id.toString() === req.user.id) {
      if (project.members[i].access.toString() === "Owner" || project.members[i].access.toString() === "Admin" || project.members[i].access.toString() === "Editor") {
        const mailOptions = {
          from: process.env.EMAIL,
          to: req.body.email,
          subject: `Invitation to join project ${project.title}`,
          html: mailBody
        };

        const newNotification = new Notifications({
          link: project._id,
          type: "project",
          message: `"${user.name}" invited you to join the project "${project.title}". Please check your email for the invitation link.`,
        });
        const savedNote = await newNotification.save();
        await User.findByIdAndUpdate(req.body.id, { $push: { notifications: savedNote._id } });

        transporter.sendMail(mailOptions, (err, data) => {
          if (err) {
            return next(err);
          } else {
            return res.status(200).json({ message: "Email sent successfully" });
          }
        });
      } else {
        return next(createError(403, "You are not allowed to invite members to this project!"));
      }
    }
  }

};

//verify invitation and add to project member
export const verifyInvitation = async (req, res, next) => {
  try {
    const { projectid, userid, access, role } = req.query;
    const code = req.params.code;
    if (code === req.app.locals.CODE) {
      req.app.locals.CODE = null;
      req.app.locals.resetSession = true;
      const project = await Project.findById(projectid);
      if (!project) return next(createError(404, "Project not found!"));
      const user = await User.findById(userid);
      if (!user) {
        return next(createError(404, "User not found"));
      }

      for (let i = 0; i < project.members.length; i++) {
        if (project.members[i].id === user.id) {
          return next(createError(403, "You are already a member of this project!"));
        }
      }
      const newMember = { id: user.id, role: role, access: access };
      const updatedProject = await Project.findByIdAndUpdate(
        projectid,
        {
          $push: { members: newMember },
        },
        { new: true }
      );
      await User.findByIdAndUpdate(user.id, { $push: { projects: updatedProject._id } }, { new: true });
      res.status(200).json({ Message: "You have successfully joined the PROJECT!" });
    }
    return res.status(400).json({ Message: "Invalid Lnk- Link Expired !" });
  } catch (err) {
    next(err);
  }
};


export const getProjectMembers = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(createError(404, "Project not found!"));
    res.status(200).json(project.members);
  } catch (err) {
    next(err);
  }
}

//add works to project
export const addWork = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const project = await Project.findById(req.params.id);
    if (!project) return next(createError(404, "Project not found!"));

    const userInProject = project.members.find(m => m.id.toString() === req.user.id);
    if (!userInProject) {
      return next(createError(403, "You are not allowed to add works to this project!"));
    }

    const taskIds = [];
    const taskData = req.body.tasks || [];

    // Create Tasks
    for (const t of taskData) {

      const impactData = analyzeTaskImpact(t.task, t.desc || "");

      const newTask = new Tasks({
        ...t,
        projectId: project._id,
        members: [...new Set(t.members)],
        organizationId: project.organizationId,
        ...impactData
      });
      const savedTask = await newTask.save();
      taskIds.push(savedTask._id);
    }

    // Create Work
    const newWork = new Works({
      ...req.body,
      projectId: project._id,
      creatorId: user._id,
      tasks: taskIds,
      organizationId: project.organizationId,
    });
    const savedWork = await newWork.save();

    // Link workId to Tasks
    await Tasks.updateMany({ _id: { $in: taskIds } }, { workId: savedWork._id });

    // Link Work to Project
    await Project.findByIdAndUpdate(project._id, { $push: { works: savedWork._id } });

    // Link Work and Tasks to Users and send Notifications
    for (let k = 0; k < taskData.length; k++) {
      const memberIds = [...new Set(taskData[k].members)];
      const currentTaskId = taskIds[k];

      for (const memberId of memberIds) {
        await User.findByIdAndUpdate(memberId, {
          $addToSet: {
            works: savedWork._id,
            tasks: currentTaskId,
          },
        });

        // Create Notification
        const newNotification = new Notifications({
          link: project._id,
          type: "task",
          message: `"${user.name}" added you to task "${taskData[k].task}" in work "${savedWork.title}" in project "${project.title.toUpperCase()}".`,
        });
        const savedNote = await newNotification.save();
        await User.findByIdAndUpdate(memberId, { $push: { notifications: savedNote._id } });

        // 🔔 Real-time Socket.IO Push Notification
        const io = req.app.get("io");
        const onlineUsers = req.app.get("onlineUsers");
        const memberSocketId = onlineUsers?.get(memberId.toString());
        if (io && memberSocketId) {
          io.to(memberSocketId).emit("task-notification", {
            type: "task_assigned",
            message: `${user.name} assigned you to "${taskData[k].task}"`,
            projectId: project._id,
            projectTitle: project.title,
            taskName: taskData[k].task,
            workTitle: savedWork.title,
            assignedBy: { name: user.name, img: user.img },
            timestamp: new Date()
          });
        }

        // Send Email Notification
        const member = await User.findById(memberId);
        if (member) {
          const mailOptions = {
            from: process.env.EMAIL,
            to: member.email,
            subject: `New Task Assessment: ${taskData[k].task}`,
            html: `
                  <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #854ce6;">New Task Assigned</h2>
                    <p>Hi <b>${member.name}</b>,</p>
                    <p>You have been assigned to a new task in the project <b>${project.title}</b>.</p>
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <p><b>Task:</b> ${taskData[k].task}</p>
                        <p><b>Work Group:</b> ${savedWork.title}</p>
                        <p><b>Assigned By:</b> ${user.name}</p>
                    </div>
                    <p>Please log in to your dashboard to view more details and track your progress.</p>
                    <br/>
                    <p style="color: #666; font-size: 12px;">The DevSync Team</p>
                  </div>
                `
          };
          transporter.sendMail(mailOptions, (err) => {
            if (err) console.log("Email error:", err);
          });
        }
      }
    }

    res.status(200).json(savedWork);
  } catch (err) {
    next(err);
  }
};



//work 

//get works
export const getWorks = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(createError(404, "Project not found!"));
    const works = await Works

      .find({ projectId: req.params.id })
      .populate("tasks")
      .populate("creatorId", "name img")
      .populate({
        path: "tasks",
        populate: {
          path: "members",
          select: "name img",
        },
      })
      .sort({ createdAt: -1 });
    res.status(200).json(works);
  } catch (err) {
    next(err);
  }
};

export const updateTaskStatus = async (req, res, next) => {
  try {
    const task = await Tasks.findById(req.params.taskId);
    if (!task) return next(createError(404, "Task not found!"));

    const project = await Project.findById(task.projectId);
    if (!project) return next(createError(404, "Project not found!"));

    const userInProject = project.members.find(m => m.id.toString() === req.user.id);
    if (!userInProject) return next(createError(403, "You are not a member of this project!"));

    const isAssigned = task.members.some(mId => mId.toString() === req.user.id);
    const isOwnerOrAdmin = ["Owner", "Admin"].includes(userInProject.access);

    if (!isAssigned && !isOwnerOrAdmin) {
      return next(createError(403, "Only the assigned user or an admin can update this task status!"));
    }

    task.status = req.body.status;
    await task.save();

    res.status(200).json({ message: "Task status updated", task });
  } catch (err) {
    next(err);
  }
};

export const updateWorkStatus = async (req, res, next) => {
  try {
    console.log("Update Work Status Request:", req.params.workId, req.body, req.user.id);
    const work = await Works.findById(req.params.workId);
    if (!work) return next(createError(404, "Work not found!"));

    const project = await Project.findById(work.projectId);
    if (!project) return next(createError(404, "Project not found!"));

    const userInProject = project.members.find(m => m.id.toString() === req.user.id);
    if (!userInProject) return next(createError(403, "You are not a member of this project!"));

    const isOwnerOrAdmin = ["Owner", "Admin"].includes(userInProject.access);

    const tasks = await Tasks.find({ workId: work._id });
    const isAssigned = tasks.some(t => t.members.some(mId => mId.toString() === req.user.id));

    if (!isAssigned && !isOwnerOrAdmin) {
      return next(createError(403, "Only assigned users or an admin can update this work status!"));
    }

    const updatedWork = await Works.findByIdAndUpdate(
      req.params.workId,
      { status: req.body.status },
      { new: true }
    );
    console.log("Work Saved with updatedWork:", updatedWork);

    // Cascade status update to tasks based on stage type
    if (project.stages && project.stages.length > 0) {
      const stage = project.stages.find(s => s.name === req.body.status);
      if (stage) {
        if (stage.type === "completed") {
          await Tasks.updateMany({ workId: req.params.workId }, { status: "Completed" });
        } else if (stage.type === "cancelled") {
          await Tasks.updateMany({ workId: req.params.workId }, { status: "Cancelled" });
        } else if (stage.type === "active") {
          // Optional: Reset tasks to working if moving back to active?
          // await Tasks.updateMany({ workId: req.params.workId }, { status: "Working" }); 
          // Maybe better not to override individual task completion status if just moving between active stages.
          // But if moving from Completed back to In Progress, users might expect re-opening.
          // Let's only do it if the PREVIOUS status was completed/cancelled.
          // But we don't have previous status easily here without another query or checking `work` before update.
          // `work` variable has the old status.
          const oldStage = project.stages.find(s => s.name === work.status);
          if (oldStage && (oldStage.type === 'completed' || oldStage.type === 'cancelled')) {
            await Tasks.updateMany({ workId: req.params.workId }, { status: "Working" });
          }
        }
      }
    } else {
      // Fallback for projects without stages defined yet (or legacy)
      if (req.body.status === "Completed") {
        await Tasks.updateMany({ workId: req.params.workId }, { status: "Completed" });
      } else if (req.body.status === "Cancelled") {
        await Tasks.updateMany({ workId: req.params.workId }, { status: "Cancelled" });
      } else if (req.body.status === "Working" && (work.status === "Completed" || work.status === "Cancelled")) {
        await Tasks.updateMany({ workId: req.params.workId }, { status: "Working" });
      }
    }
    const io = req.app.get("io");
    if (io) {
      io.emit("work-updated", { projectId: project._id, workId: updatedWork._id });
    }

    res.status(200).json({ message: "Work status updated", work: updatedWork });
  } catch (err) {
    console.log("Error updating work status:", err);
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Tasks.findById(req.params.taskId);
    if (!task) return next(createError(404, "Task not found!"));

    const project = await Project.findById(task.projectId);
    const userInProject = project.members.find(m => m.id.toString() === req.user.id);

    if (!userInProject || !["Owner", "Admin", "Editor"].includes(userInProject.access)) {
      return next(createError(403, "You do not have permission to delete tasks!"));
    }

    await Tasks.findByIdAndDelete(req.params.taskId);
    await Works.findByIdAndUpdate(task.workId, { $pull: { tasks: req.params.taskId } });
    await User.updateMany({ tasks: req.params.taskId }, { $pull: { tasks: req.params.taskId } });

    res.status(200).json("Task deleted successfully");
  } catch (err) {
    next(err);
  }
};

export const deleteWork = async (req, res, next) => {
  try {
    const work = await Works.findById(req.params.workId);
    if (!work) return next(createError(404, "Work not found!"));

    const project = await Project.findById(work.projectId);
    const userInProject = project.members.find(m => m.id.toString() === req.user.id);

    // Check permissions: Creator or Admin/Owner
    const isCreator = work.creatorId.toString() === req.user.id;
    const isOwnerOrAdmin = ["Owner", "Admin"].includes(userInProject?.access);

    if (!isCreator && !isOwnerOrAdmin) {
      return next(createError(403, "You do not have permission to delete this work!"));
    }

    // Delete Work
    await Works.findByIdAndDelete(req.params.workId);

    // Remove Work from Project
    await Project.findByIdAndUpdate(work.projectId, { $pull: { works: req.params.workId } });

    // Delete associated Tasks
    const tasks = await Tasks.find({ workId: req.params.workId });
    const taskIds = tasks.map(t => t._id);
    await Tasks.deleteMany({ workId: req.params.workId });

    // Update Users (remove tasks)
    await User.updateMany({ tasks: { $in: taskIds } }, { $pullAll: { tasks: taskIds } });

    res.status(200).json("Work deleted successfully");
  } catch (err) {
    next(err);
  }
};

export const addNewTask = async (req, res, next) => {
  try {
    const work = await Works.findById(req.params.workId);
    if (!work) return next(createError(404, "Work not found!"));

    const project = await Project.findById(work.projectId);
    const userInProject = project.members.find(m => m.id.toString() === req.user.id);

    if (!userInProject) {
      return next(createError(403, "You do not have permission to add tasks!"));
    }

    // AI Impact Analysis Simulation
    const impactData = analyzeTaskImpact(req.body.task, req.body.desc || "");

    const newTask = new Tasks({
      ...req.body,
      workId: work._id,
      projectId: project._id,
      members: [...new Set(req.body.members)],
      organizationId: project.organizationId,
      ...impactData
    });
    const savedTask = await newTask.save();

    await Works.findByIdAndUpdate(work._id, { $push: { tasks: savedTask._id } });

    // Update Users
    const memberIds = [...new Set(req.body.members)];
    await User.updateMany(
      { _id: { $in: memberIds } },
      { $addToSet: { tasks: savedTask._id, works: work._id } }
    );

    // Send Email to Assigned Members
    if (memberIds.length > 0) {
      const memberUsers = await User.find({ _id: { $in: memberIds } });
      const creator = await User.findById(req.user.id); // Current user who added the task

      // 🔔 Real-time Socket.IO Push Notification for each member
      const io = req.app.get("io");
      const onlineUsers = req.app.get("onlineUsers");

      // Create notifications in DB and push live
      for (const member of memberUsers) {
        const newNotification = new Notifications({
          link: work.projectId,
          type: "task",
          message: `"${creator.name}" assigned you to task "${newTask.task}" in project "${project.title.toUpperCase()}".`,
        });
        const savedNote = await newNotification.save();
        await User.findByIdAndUpdate(member._id, { $push: { notifications: savedNote._id } });

        const memberSocketId = onlineUsers?.get(member._id.toString());
        if (io && memberSocketId) {
          io.to(memberSocketId).emit("task-notification", {
            type: "task_assigned",
            message: `${creator.name} assigned you to "${newTask.task}"`,
            projectId: project._id,
            projectTitle: project.title,
            taskName: newTask.task,
            workTitle: work.title,
            assignedBy: { name: creator.name, img: creator.img },
            timestamp: new Date()
          });
        }
      }

      memberUsers.forEach(member => {
        const mailOptions = {
          from: process.env.EMAIL,
          to: member.email,
          subject: `New Task Assigned: ${newTask.task}`,
          html: `
                 <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                   <h2 style="color: #854ce6;">New Task Assigned</h2>
                   <p>Hi <b>${member.name}</b>,</p>
                   <p>You have been assigned to a new task in the project <b>${project.title}</b>.</p>
                   <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                       <p><b>Task:</b> ${newTask.task}</p>
                       <p><b>Work Group:</b> ${work.title}</p>
                       <p><b>Assigned By:</b> ${creator.name}</p>
                       <p><b>Description:</b> ${newTask.desc || "No description provided."}</p>
                       <p><b>Due Date:</b> ${newTask.end_date ? new Date(newTask.end_date).toLocaleDateString() : "No due date"}</p>
                   </div>
                   <p>Please log in to your dashboard to view more details.</p>
                   <br/>
                   <p style="color: #666; font-size: 12px;">The DevSync Team</p>
                 </div>
               `
        };
        transporter.sendMail(mailOptions, (err) => {
          if (err) console.log("Email error:", err);
        });
      });
    }

    res.status(200).json(savedTask);
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Tasks.findById(req.params.taskId);
    if (!task) return next(createError(404, "Task not found!"));

    const project = await Project.findById(task.projectId);
    const userInProject = project.members.find(m => m.id.toString() === req.user.id);

    if (!userInProject || !["Owner", "Admin", "Editor"].includes(userInProject.access)) {
      // Also allow assigned members to update status, but this controller updates details too? 
      // For safety, restrict full update to Editors+. Status update has its own controller `updateTaskStatus`.
      return next(createError(403, "You do not have permission to update this task!"));
    }

    // AI Impact Analysis Simulation
    const impactData = analyzeTaskImpact(req.body.task || task.task, req.body.desc || task.desc || "");

    const updatedTask = await Tasks.findByIdAndUpdate(
      req.params.taskId,
      { $set: { ...req.body, ...impactData } },
      { new: true }
    );

    // Sync Members (simple approach: just add to new members, removing from old is harder without diff)
    // For now, let's just ensure new members have the task.
    if (req.body.members) {
      await User.updateMany(
        { _id: { $in: req.body.members } },
        { $addToSet: { tasks: task._id, works: task.workId } }
      );
    }

    res.status(200).json(updatedTask);
  } catch (err) {
    next(err);
  }
};

export const startTimer = async (req, res, next) => {
  try {
    console.log("startTimer requested with taskId:", req.params.taskId);
    const task = await Tasks.findById(req.params.taskId);
    if (!task) {
      console.log("Could not find Task in database:", req.params.taskId);
      return next(createError(404, "Task not found!"));
    }

    // Check if user is assigned or has permission
    const project = await Project.findById(task.projectId);
    const userInProject = project.members.find(m => m.id.toString() === req.user.id);
    if (!userInProject) return next(createError(403, "You are not a member of this project!"));

    const isAssigned = task.members.some(mId => mId.toString() === req.user.id);
    const hasPerms = ["Owner", "Admin", "Editor"].includes(userInProject.access);

    if (!isAssigned && !hasPerms) {
      return next(createError(403, "You do not have permission to track time for this task!"));
    }

    if (task.active_session?.is_active) {
      return next(createError(400, "Timer is already running!"));
    }

    const updatedTask = await Tasks.findByIdAndUpdate(
      req.params.taskId,
      {
        $set: {
          active_session: {
            start_time: new Date(),
            is_active: true
          }
        }
      },
      { new: true }
    );
    res.status(200).json(updatedTask);
  } catch (err) {
    next(err);
  }
};

export const stopTimer = async (req, res, next) => {
  try {
    const task = await Tasks.findById(req.params.taskId);
    if (!task) return next(createError(404, "Task not found!"));

    const project = await Project.findById(task.projectId);
    const userInProject = project.members.find(m => m.id.toString() === req.user.id);
    if (!userInProject) return next(createError(403, "You are not a member of this project!"));

    const isAssigned = task.members.some(mId => mId.toString() === req.user.id);
    const hasPerms = ["Owner", "Admin", "Editor"].includes(userInProject.access);

    if (!isAssigned && !hasPerms) {
      return next(createError(403, "You do not have permission to stop time for this task!"));
    }

    if (!task.active_session?.is_active) {
      return next(createError(400, "Timer is not running!"));
    }

    const sessionStart = new Date(task.active_session.start_time);
    const sessionEnd = new Date();
    const durationMs = sessionEnd - sessionStart; // duration in milliseconds
    const durationMin = durationMs / (1000 * 60); // duration in minutes

    const updatedTask = await Tasks.findByIdAndUpdate(
      req.params.taskId,
      {
        $inc: { time_tracked: durationMin }, // Accumulate time in minutes
        $set: {
          active_session: {
            start_time: null,
            is_active: false
          }
        }
      },
      { new: true }
    );
    res.status(200).json(updatedTask);
  } catch (err) {
    next(err);
  }
};

export const updateProjectStages = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(createError(404, "Project not found!"));

    const userInProject = project.members.find(m => m.id.toString() === req.user.id);
    if (!userInProject || !["Owner", "Admin"].includes(userInProject.access)) {
      return next(createError(403, "Only Owner or Admin can update project workflows!"));
    }

    const oldStages = project.stages;
    const newStages = req.body.stages;

    // Handle renovations (renames)
    for (const newStage of newStages) {
      if (newStage._id) {
        const oldStage = oldStages.find(s => s._id.toString() === newStage._id.toString());
        if (oldStage && oldStage.name !== newStage.name) {
          // Stage renamed. Update Works.
          await Works.updateMany(
            { projectId: project._id, status: oldStage.name },
            { status: newStage.name }
          );
        }
      }
    }

    // Update Project

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: { stages: newStages } },
      { new: true }
    );
    res.status(200).json(updatedProject);
  } catch (err) {
    next(err);
  }
};

export const getWorkloadStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Find all projects where current user is a member
    const projects = await Project.find({ "members.id": userId });
    const projectIds = projects.map(p => p._id);

    // 2. Find all tasks in these projects that are active (not completed/cancelled)
    const tasks = await Tasks.find({
      projectId: { $in: projectIds },
      status: { $nin: ["Completed", "Cancelled"] }
    });

    // 3. Map to store task counts per member
    const memberStats = new Map();

    // Aggregate unique members from all projects first
    projects.forEach(project => {
      project.members.forEach(member => {
        const mId = member.id.toString();
        if (!memberStats.has(mId)) {
          memberStats.set(mId, 0);
        }
      });
    });

    // 4. Count tasks for each member
    tasks.forEach(task => {
      task.members.forEach(memberId => {
        const mId = memberId.toString();
        if (memberStats.has(mId)) {
          memberStats.set(mId, memberStats.get(mId) + 1);
        } else {
          memberStats.set(mId, 1);
        }
      });
    });

    // 5. Fetch user details for all these members
    const uniqueMemberIds = Array.from(memberStats.keys());
    const users = await User.find({ _id: { $in: uniqueMemberIds } }).select("name img email");

    const userDetails = new Map();
    users.forEach(u => userDetails.set(u._id.toString(), u));

    // 6. Build response data
    const workloadData = [];
    memberStats.forEach((count, id) => {
      const user = userDetails.get(id);
      if (user) {
        let status = "Balanced";
        if (count >= 6) status = "Overloaded";
        else if (count < 3) status = "Free Capacity";

        workloadData.push({
          _id: user._id,
          name: user.name,
          img: user.img,
          email: user.email,
          taskCount: count,
          status: status
        });
      }
    });

    // Sort by Task Count descending
    workloadData.sort((a, b) => b.taskCount - a.taskCount);

    res.status(200).json(workloadData);

  } catch (err) {
    next(err);
  }
};

export const createSnapshot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id).populate({
      path: "members.id",
      select: "name email img"
    }).lean();
    if (!project) return next(createError(404, "Project not found"));

    const works = await Works.find({ projectId: id })
      .populate("tasks")
      .populate("creatorId", "name img")
      .populate({
        path: "tasks",
        populate: {
          path: "members",
          select: "name img",
        },
      })
      .lean();

    const snapshot = { project, works };

    const newSnapshot = new ProjectSnapshot({
      projectId: id,
      message: req.body.message || "Manual Snapshot",
      snapshotData: snapshot,
      createdBy: req.user.id
    });
    const savedSnapshot = await newSnapshot.save();
    res.status(200).json(savedSnapshot);
  } catch (err) {
    next(err);
  }
};

export const getSnapshots = async (req, res, next) => {
  try {
    const snapshots = await ProjectSnapshot.find({ projectId: req.params.id })
      .populate("createdBy", "name img")
      .sort("-createdAt");
    res.status(200).json(snapshots);
  } catch (err) {
    next(err);
  }
};



// GitHub Integration Controller
export const getGitHubActivity = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(createError(404, "Project not found!"));

    // e.g. "facebook/react" or "https://github.com/facebook/react"
    let repo = project.githubRepo;
    if (!repo) return res.status(200).json([]);

    // Parse URL if user pasted full link
    if (repo.includes("github.com/")) {
      const parts = repo.split("github.com/");
      repo = parts[1];
      // Strip out trailing slash or branch info if pasted weirdly
      repo = repo.split("/").slice(0, 2).join("/");
    }

    // Strip .git if the user pasted a clone URL
    if (repo.endsWith(".git")) {
      repo = repo.slice(0, -4);
    }

    // Call public GitHub API directly from backend
    // Fetch commits instead of events to guarantee rich history
    const response = await fetch(`https://api.github.com/repos/${repo}/commits`);

    if (!response.ok) {
      if (response.status === 404) {
        return next(createError(404, "GitHub repository not found or is private."));
      }
      return next(createError(response.status, "Failed to fetch GitHub data"));
    }

    const commitsData = await response.json();

    // Map the commit data
    const commits = commitsData.slice(0, 30).map(c => ({
      id: c.sha,
      actor: {
        name: c.commit.author.name || c.author?.login || "Unknown",
        avatar: c.author?.avatar_url || "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
        url: c.author?.html_url || `https://github.com/${c.commit.author.name}`
      },
      message: c.commit.message,
      url: c.html_url,
      created_at: c.commit.author.date
    }));

    res.status(200).json(commits);
  } catch (err) {
    next(err);
  }
};

export const warpDriveProject = async (req, res, next) => {
  const { prompt } = req.body;
  if (!prompt) return next(createError(400, "Warp Drive requires a prompt description."));

  try {
    const user = await User.findById(req.user.id);
    if (!user) return next(createError(404, "User not found"));

    // 1. Generate description and tags via AI
    const aiPayload = await generateProjectScaffold(prompt);

    // 2. Create the Project with AI-generated description and tags
    const newProject = new Project({
      title: "Warped Project: " + (aiPayload.tags?.[0] || 'App'),
      desc: aiPayload.desc || prompt,
      tags: aiPayload.tags || [],
      members: [{ id: user.id, img: user.img, email: user.email, name: user.name, role: "d", access: "Owner" }],
      organizationId: user.currentOrganization
    });
    const savedProject = await newProject.save();

    await User.findByIdAndUpdate(user.id, { $push: { projects: savedProject._id } });
    if (user.currentOrganization) {
      await Organization.findByIdAndUpdate(user.currentOrganization, { $push: { projects: savedProject._id } });
    }

    res.status(201).json({ message: "Warp Drive Sequence Completed", projectId: savedProject._id });
  } catch (err) {
    console.error("WARP DRIVE ERROR:", err);
    next(err);
  }
};

