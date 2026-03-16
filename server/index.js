import express from 'express';
import * as fs from 'fs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import projectRoutes from './routes/project.js';
import teamRoutes from './routes/teams.js';
import communityRoutes from './routes/community.js';
import chatRoutes from './routes/chat.js';
import messageRoutes from './routes/message.js';
import organizationRoutes from './routes/organization.js'; // Added
import roleRoutes from './routes/role.js';
import zoomRoutes from './routes/zoom.js';
import aiRoutes from './routes/ai.js';
import cookieParser from "cookie-parser";
import cors from 'cors';
import morgan from 'morgan';
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
dotenv.config();

/** Middlewares */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
const corsConfig = {
    credentials: true,
    origin: true,
};
app.use(cors(corsConfig));
app.use(morgan('tiny'));
app.disable('x-powered-by');

const port = process.env.PORT || 8700;

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173", // Make sure this matches frontend URL
        methods: ["GET", "POST"],
        credentials: true
    },
});

// Store online users: userId -> socketId
const onlineUsers = new Map();

io.on("connection", (socket) => {
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
        // Broadcast online status to all clients
        io.emit("user-online", userId);
    });

    socket.on("join-chat", (room) => {
        socket.join(room);
    });

    socket.on("send-msg", (data) => {
        socket.to(data.chatId).emit("msg-recieve", data);
    });

    // Real-time task notification: server pushes to specific user
    // Controllers call: io.to(socketId).emit("task-notification", payload)
    // No handler needed here — emitting is done from controllers via app.get("io")

    socket.on("disconnect", () => {
        for (const [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
                io.emit("user-offline", userId);
                break;
            }
        }
    });
});


// Share io and onlineUsers with controllers
app.set("io", io);
app.set("onlineUsers", onlineUsers);


const connect = () => {
    mongoose.set('strictQuery', true);
    mongoose.connect(process.env.MONGO_URL).then(() => {
        console.log('MongoDB connected');
    }).catch((err) => {
        console.log(err);
    });
};

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/organization", organizationRoutes); // Added
app.use("/api/roles", roleRoutes);
app.use("/api/zoom", zoomRoutes);
app.use("/api/ai", aiRoutes);

app.use((err, req, res, next) => {
    fs.appendFileSync('error.log', new Date().toISOString() + ' - ' + (err.stack || err.message || err.toString()) + '\n');
    console.error(err);
    const status = err.status || 500;
    const message = err.message || "Something went wrong";
    return res.status(status).json({
        success: false,
        status,
        message
    });
});

httpServer.listen(port, () => {
    console.log("Connected");
    connect();
});
