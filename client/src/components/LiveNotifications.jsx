import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import { CheckCircle, Close, Assignment, TaskAlt } from "@mui/icons-material";
import { Avatar } from "@mui/material";

// ─── Animations ───────────────────────────────────────────────────────────────
const slideIn = keyframes`
  from { transform: translateX(120%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideOut = keyframes`
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(120%); opacity: 0; }
`;

const progressShrink = keyframes`
  from { width: 100%; }
  to { width: 0%; }
`;

// ─── Styled Components ────────────────────────────────────────────────────────
const NotificationStack = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
`;

const NotifCard = styled.div`
  pointer-events: all;
  width: 360px;
  background: #1a1a2e;
  border: 1px solid #854CE640;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  overflow: hidden;
  animation: ${({ leaving }) =>
        leaving
            ? css`${slideOut} 0.3s ease-in forwards`
            : css`${slideIn} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`};
  box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px #854CE620;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #854CE6, #10B981);
  }
`;

const NotifTop = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const IconCircle = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #854CE620;
  border: 1px solid #854CE640;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const NotifContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotifTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 3px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const NotifMessage = styled.div`
  font-size: 12px;
  color: #aaa;
  line-height: 1.5;
`;

const NotifMeta = styled.div`
  font-size: 11px;
  color: #666;
  margin-top: 4px;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: #555;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: color 0.15s;
  
  &:hover { color: #999; }
`;

const AssignedBy = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: #0d0d1a;
  border: 1px solid #2a2a4a;
  border-radius: 8px;
  font-size: 11px;
  color: #888;
`;

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #854CE6, #10B981);
  border-radius: 0 0 14px 14px;
  animation: ${progressShrink} ${({ duration }) => duration || 5}s linear forwards;
`;

// ─── Badge for NEW notifications in navbar ────────────────────────────────────
export const LiveNotifBadge = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #EF4444;
  color: white;
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #0d0d1a;
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }
`;

// ─── Duration constant ────────────────────────────────────────────────────────
const DURATION = 6; // seconds

// ─── Main Component ───────────────────────────────────────────────────────────
/**
 * LiveNotifications
 * This component should be mounted once at the app level (e.g. in AppContent).
 * It listens to the socket's "task-notification" event and shows toast cards.
 *
 * Props:
 *   socket - the socket.io-client instance
 */
const LiveNotifications = ({ socket }) => {
    const [notifications, setNotifications] = useState([]);
    const timersRef = useRef({});

    useEffect(() => {
        if (!socket) return;

        const handleTaskNotification = (data) => {
            const id = Date.now() + Math.random();
            setNotifications(prev => [...prev, { ...data, id, leaving: false }]);

            // Auto-dismiss after DURATION seconds
            timersRef.current[id] = setTimeout(() => {
                dismiss(id);
            }, DURATION * 1000);
        };

        socket.on("task-notification", handleTaskNotification);

        return () => {
            socket.off("task-notification", handleTaskNotification);
        };
    }, [socket]);

    const dismiss = (id) => {
        // Trigger leave animation
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, leaving: true } : n)
        );
        // Remove from DOM after animation completes
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
            clearTimeout(timersRef.current[id]);
            delete timersRef.current[id];
        }, 350);
    };

    if (notifications.length === 0) return null;

    return (
        <NotificationStack>
            {notifications.map((notif) => (
                <NotifCard key={notif.id} leaving={notif.leaving}>
                    <NotifTop>
                        <IconCircle>
                            <TaskAlt sx={{ fontSize: 20, color: "#854CE6" }} />
                        </IconCircle>
                        <NotifContent>
                            <NotifTitle>
                                <CheckCircle sx={{ fontSize: 14, color: "#10B981" }} />
                                Task Assigned
                            </NotifTitle>
                            <NotifMessage>
                                You've been assigned to <strong style={{ color: "#fff" }}>"{notif.taskName}"</strong>
                            </NotifMessage>
                            {notif.projectTitle && (
                                <NotifMeta>📁 {notif.projectTitle} › {notif.workTitle}</NotifMeta>
                            )}
                        </NotifContent>
                        <CloseBtn onClick={() => dismiss(notif.id)}>
                            <Close sx={{ fontSize: 16 }} />
                        </CloseBtn>
                    </NotifTop>

                    {notif.assignedBy?.name && (
                        <AssignedBy>
                            <Avatar
                                src={notif.assignedBy.img}
                                alt={notif.assignedBy.name}
                                sx={{ width: 20, height: 20, fontSize: 10 }}
                            />
                            Assigned by <strong style={{ color: "#ccc" }}>{notif.assignedBy.name}</strong>
                            <span style={{ marginLeft: "auto" }}>
                                {new Date(notif.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                        </AssignedBy>
                    )}

                    <ProgressBar duration={DURATION} />
                </NotifCard>
            ))}
        </NotificationStack>
    );
};

export default LiveNotifications;
