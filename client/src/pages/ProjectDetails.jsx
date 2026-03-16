import React, { useEffect, useState, useRef } from "react";
import styled, { keyframes, useTheme } from "styled-components";
import { useParams } from "react-router-dom";
import {
  Add,
  Delete,
  Edit,
  PersonAdd,
  MoreHoriz,
  CheckCircleOutline,
  DonutLarge,
  CancelOutlined,
  FilterList,
  BarChart,
  ViewKanban,
  Chat,
  Settings,
  HistoryToggleOff,
  ReportProblem,
  GitHub,
  VideoCall,
  VideoCameraFront,
} from "@mui/icons-material";
import { CircularProgress, IconButton, Avatar, AvatarGroup, Tooltip, TextField, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useDrop } from "react-dnd";
import { getProjectDetails, getWorks, updateWorkStatus, getProjectChat, createZoomMeeting, updateProject } from "../api/index";
import { openSnackbar } from "../redux/snackbarSlice";
import WorkCards from "../components/WorkCards";
import InviteMembers from "../components/InviteMembers";
import AddWork from "../components/AddWork";
import WorkDetails from "../components/WorkDetails";
import UpdateProject from "../components/UpdateProject";
import WorkflowBuilder from "../components/WorkflowBuilder";
import DeletePopup from "../components/DeletePopup";
import MemberCard from "../components/MemberCard";
import ToolsCard from "../components/ToolsCard";
import IdeaCard from "../components/IdeaCard";
import ChatContainer from "../components/ChatContainer";
import ProjectTimeline from "../components/ProjectTimeline";
import GitHubFeed from "../components/GitHubFeed";
import { tagColors } from "../data/data";
import ProjectDocuments from "../components/ProjectDocuments";
import ProjectAnalytics from "../components/ProjectAnalytics";
import { io } from "socket.io-client";

// --- Animations ---
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// --- Styled Components ---
const Container = styled.div`
  padding: 30px;
  background-color: ${({ theme }) => theme.bg};
  height: 100vh;
  overflow-y: auto;
  background: 
    radial-gradient(circle at 10% 20%, ${({ theme }) => theme.bgLighter} 0%, transparent 20%),
    radial-gradient(circle at 90% 80%, ${({ theme }) => theme.primary + "15"} 0%, transparent 20%),
    radial-gradient(${({ theme }) => theme.textSoft + "10"} 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 30px 30px;
  background-attachment: local;

  @media screen and (max-width: 768px) {
    padding: 15px;
  }
`;

const Header = styled.div`
  margin-bottom: 30px;
  animation: ${fadeInUp} 0.5s ease-out;
`;

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const ProjectTitle = styled.h1`
  font-size: 32px;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  margin: 0;
  background: linear-gradient(90deg, ${({ theme }) => theme.text}, ${({ theme }) => theme.textSoft});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${({ status, theme }) => {
    if (status === "Completed") return "rgba(16, 185, 129, 0.1)"; // Green
    if (status === "Working") return "rgba(59, 130, 246, 0.1)"; // Blue
    if (status === "Cancelled") return "rgba(239, 68, 68, 0.1)"; // Red
    return theme.bgLighter;
  }};
  color: ${({ status, theme }) => {
    if (status === "Completed") return "#10B981";
    if (status === "Working") return "#3B82F6";
    if (status === "Cancelled") return "#EF4444";
    return theme.textSoft;
  }};
  border: 1px solid ${({ status, theme }) => {
    if (status === "Completed") return "rgba(16, 185, 129, 0.2)";
    if (status === "Working") return "rgba(59, 130, 246, 0.2)";
    if (status === "Cancelled") return "rgba(239, 68, 68, 0.2)";
    return "transparent";
  }};
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: 12px;
  vertical-align: middle;
`;

const ProjectDesc = styled.p`
  color: ${({ theme }) => theme.textSoft};
  font-size: 15px;
  line-height: 1.6;
  max-width: 800px;
  margin-bottom: 20px;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
`;

const TagList = styled.div`
  display: flex;
  gap: 8px;
`;

const ProjectTag = styled.span`
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ color, theme }) => color + "15"};
  color: ${({ color, theme }) => color};
  border: 1px solid ${({ color }) => color + "30"};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const IconButtonStyled = styled(IconButton)`
  background: ${({ theme }) => theme.bgLighter} !important;
  border: 1px solid ${({ theme }) => theme.soft + "50"} !important;
  color: ${({ theme }) => theme.textSoft} !important;
  transition: all 0.2s !important;
  &:hover {
    transform: translateY(-2px);
    background: ${({ theme }) => theme.soft} !important;
    color: ${({ theme }) => theme.text} !important;
  }
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 30px;
  animation: ${fadeIn} 0.8s ease-out;

  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const KanbanBoard = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  
  @media screen and (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const KanbanColumn = styled.div`
  background: ${({ theme, isOver }) => isOver ? theme.primary + "05" : theme.bgLighter};
  border-radius: 16px;
  padding: 16px;
  min-height: 500px;
  border: 1px dashed ${({ theme, isOver }) => isOver ? theme.primary : theme.soft};
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ColumnHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 2px solid ${({ color }) => color || "transparent"};
  margin-bottom: 2px;
`;

const ColumnTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CountBadge = styled.span`
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.textSoft};
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Widget = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border-radius: 16px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.soft};
`;

const WidgetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const WidgetTitle = styled.h4`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const ViewTabs = styled.div`
  display: flex;
  gap: 4px;
  background: ${({ theme }) => theme.bg};
  border-radius: 12px;
  padding: 4px;
`;

const ViewTab = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  background: ${({ active, theme }) => active ? theme.primary : 'transparent'};
  color: ${({ active, theme }) => active ? '#fff' : theme.textSoft};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: ${({ active, theme }) => active ? theme.primary : theme.soft + '60'};
  }
`;

const KanbanColumnDrop = ({ status, title, color, icon, onAdd, count, moveWork, children }) => {
  const theme = useTheme();
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "WORK_CARD",
    drop: (item) => moveWork(item.id, status),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }), [moveWork, status]);

  return (
    <KanbanColumn ref={drop} isOver={isOver}>
      <ColumnHeader color={color}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ColumnTitle>{icon} {title}</ColumnTitle>
          <CountBadge>{count}</CountBadge>
        </div>
        {onAdd && (
          <IconButton size="small" onClick={onAdd}>
            <Add fontSize="small" sx={{ color: theme.text }} />
          </IconButton>
        )}
      </ColumnHeader>
      {children}
    </KanbanColumn>
  );
};

const ProjectDetails = () => {
  const { id } = useParams();
  const theme = useTheme();
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const { currentUser } = useSelector((state) => state.user);

  const [item, setItems] = useState(null);
  const [members, setMembers] = useState([]);
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [created, setCreated] = useState(false);
  const [showAddWork, setShowAddWork] = useState(false);
  const [activeView, setActiveView] = useState("kanban");
  // Idea List State
  const [newIdea, setNewIdea] = useState("");
  const [showAddIdea, setShowAddIdea] = useState(false);

  // Chat State
  const [projectChat, setProjectChat] = useState(null);
  const [socket, setSocket] = useState(null);

  const loadWorks = async () => {
    try {
      const worksRes = await getWorks(id, token);
      setWorks(worksRes.data);
    } catch (err) {
      console.log(err);
    }
  };

  // Socket Connection
  useEffect(() => {
    if (currentUser) {
      const newSocket = io("http://localhost:8700");
      setSocket(newSocket);
      newSocket.emit("add-user", currentUser._id);

      newSocket.on("work-updated", (data) => {
        if (data.projectId === id) {
          loadWorks();
        }
      });

      return () => {
        newSocket.off("work-updated");
        newSocket.disconnect();
      };
    }
  }, [currentUser, id]);

  // Fetch Chat
  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await getProjectChat(id, token);
        setProjectChat(res.data);
      } catch (err) {
        console.log(err);
      }
    }
    if (id && token) fetchChat();
  }, [id, token]);


  // Popups & Overlays
  const [currentWork, setCurrentWork] = useState({});
  const [openWork, setOpenWork] = useState(false);
  const [invitePopup, setInvitePopup] = useState(false);
  const [openUpdate, setOpenUpdate] = useState({ state: false, type: "all", data: null });
  const [openWorkflow, setOpenWorkflow] = useState(false);
  const [openDelete, setOpenDelete] = useState({ state: false, type: "Project", data: null, token });

  const fetchData = async () => {
    setLoading(true);
    try {
      const projectRes = await getProjectDetails(id, token);
      setItems(projectRes.data);
      setMembers(projectRes.data.members);

      await loadWorks();

      setLoading(false);
    } catch (err) {
      dispatch(openSnackbar({ message: err.response?.data?.message || "Error fetching data", severity: "error" }));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, created]);

  const openWorkDetails = (work) => {
    setCurrentWork(work);
    setOpenWork(true);
  };

  const moveWork = async (workId, newStatus) => {
    // Optimistic Update
    const originalWorks = [...works];
    setWorks(works.map(w => {
      if (w._id === workId) {
        let updatedTasks = w.tasks;
        if (newStatus === "Completed" || newStatus === "Cancelled") {
          updatedTasks = w.tasks.map(t => ({ ...t, status: newStatus }));
        }
        return { ...w, status: newStatus, tasks: updatedTasks };
      }
      return w;
    }));

    try {
      await updateWorkStatus(workId, newStatus, token);
      dispatch(openSnackbar({ message: `Work moved to ${newStatus}`, severity: "success" }));
    } catch (err) {
      setWorks(originalWorks); // Revert
      dispatch(openSnackbar({ message: err.response?.data?.message || "Failed to move work", severity: "error" }));
    }
  };

  const handleAddIdea = async () => {
    if (!newIdea.trim()) return;
    try {
      const updatedIdeas = [...(item.ideas || []), newIdea];
      const res = await updateProject(id, { ideas: updatedIdeas }, token);
      if (res.status === 200) {
        setItems({ ...item, ideas: updatedIdeas });
        setNewIdea("");
        setShowAddIdea(false);
      }
    } catch (err) {
      dispatch(openSnackbar({ message: "Failed to add idea", severity: "error" }));
    }
  };

  const handleRemoveIdea = async (index) => {
    try {
      const updatedIdeas = (item.ideas || []).filter((_, i) => i !== index);
      const res = await updateProject(id, { ideas: updatedIdeas }, token);
      if (res.status === 200) {
        setItems({ ...item, ideas: updatedIdeas });
      }
    } catch (err) {
      dispatch(openSnackbar({ message: "Failed to remove idea", severity: "error" }));
    }
  };

  const deleteWorkLocal = (workId) => {
    setWorks((prev) => prev.filter((w) => w._id !== workId));
  };


  const handleCreateMeet = async () => {
    try {
      const res = await createZoomMeeting(id, token);
      if (res.data.meetingLink) {
        setItems({ ...item, meetingLink: res.data.meetingLink });
        window.open(res.data.meetingLink, "_blank");
        dispatch(openSnackbar({ message: "Zoom Meeting generated successfully!", severity: "success" }));
      }
    } catch (err) {
      console.error(err);
      dispatch(openSnackbar({ message: "Failed to initialize Zoom Meeting creation.", severity: "error" }));
    }
  };


  if (loading) {
    return (
      <Container style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!item) {
    return (
      <Container style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'white' }}>Project not found</div>
      </Container>
    );
  }

  const stages = (item.stages && item.stages.length > 0)
    ? [...item.stages].sort((a, b) => a.position - b.position)
    : [
      { name: "Working", color: "#3B82F6", position: 0 },
      { name: "Completed", color: "#10B981", position: 1 },
      { name: "Cancelled", color: "#EF4444", position: 2 }
    ];

  return (
    <Container>

      {openWork && <WorkDetails setOpenWork={setOpenWork} work={currentWork} reloadWorks={loadWorks} />}
      {openUpdate.state && <UpdateProject openUpdate={openUpdate} setOpenUpdate={setOpenUpdate} type={openUpdate.type} />}
      {openWorkflow && <WorkflowBuilder open={openWorkflow} setOpen={setOpenWorkflow} project={item} setProject={setItems} />}
      {openDelete.state && <DeletePopup openDelete={openDelete} setOpenDelete={setOpenDelete} />}
      {invitePopup && <InviteMembers setInvitePopup={setInvitePopup} id={id} teamInvite={false} />}

      <Header>
        <TitleWrapper>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <ProjectTitle>{item.title}</ProjectTitle>
              <StatusBadge status={item.status}>{item.status}</StatusBadge>
            </div>
            <ProjectDesc>{item.desc}</ProjectDesc>
            <MetaRow>
              <AvatarGroup max={4}>
                {members.map((member) => (
                  <Avatar key={member.id?._id} alt={member.id?.name} src={member.id?.img} />
                ))}
              </AvatarGroup>
              <TagList>
                {item.tags.map((tag, i) => (
                  <ProjectTag key={i} color={tagColors[i % tagColors.length]}>{tag}</ProjectTag>
                ))}
              </TagList>
            </MetaRow>
          </div>
          <ActionButtons>
            {item.meetingLink && (
              <Tooltip title="Join Zoom/Meet Meeting">
                <IconButtonStyled onClick={() => window.open(item.meetingLink, "_blank")} style={{ color: '#2D8CFF', borderColor: '#2D8CFF50' }}>
                  <VideoCall />
                </IconButtonStyled>
              </Tooltip>
            )}
            {!item.meetingLink && (
              <Tooltip title="Create Zoom Meeting">
                <IconButtonStyled onClick={handleCreateMeet} style={{ color: '#0F9D58', borderColor: '#0F9D5850' }}>
                  <VideoCameraFront />
                </IconButtonStyled>
              </Tooltip>
            )}
            <Tooltip title="Invite Members">
              <IconButtonStyled onClick={() => setInvitePopup(true)}><PersonAdd /></IconButtonStyled>
            </Tooltip>
            <Tooltip title="Edit Project">
              <IconButtonStyled onClick={() => setOpenUpdate({ state: true, type: 'all', data: item })}><Edit /></IconButtonStyled>
            </Tooltip>
            <Tooltip title="Customize Workflow">
              <IconButtonStyled onClick={() => setOpenWorkflow(true)}><Settings /></IconButtonStyled>
            </Tooltip>
            <Tooltip title="Delete Project">
              <IconButtonStyled onClick={() => setOpenDelete({ state: true, type: 'Project', name: item.title, id: item._id, token: token })}><Delete /></IconButtonStyled>
            </Tooltip>
          </ActionButtons>
        </TitleWrapper>
      </Header>

      <div style={{ display: 'flex', justifyContent: 'flex-start', padding: '0 0 12px 0' }}>
        <ViewTabs>
          <ViewTab active={activeView === 'kanban'} onClick={() => setActiveView('kanban')}>
            <ViewKanban sx={{ fontSize: 16 }} /> Kanban
          </ViewTab>
          <ViewTab active={activeView === 'chat'} onClick={() => setActiveView('chat')}>
            <Chat sx={{ fontSize: 16 }} /> Chat
          </ViewTab>
          <ViewTab active={activeView === 'timeline'} onClick={() => setActiveView('timeline')}>
            <HistoryToggleOff sx={{ fontSize: 16 }} /> Timeline
          </ViewTab>
          <ViewTab active={activeView === 'github'} onClick={() => setActiveView('github')}>
            <GitHub sx={{ fontSize: 16 }} /> GitHub
          </ViewTab>
          <ViewTab active={activeView === 'documents'} onClick={() => setActiveView('documents')}>
            <DonutLarge sx={{ fontSize: 16 }} /> Documents
          </ViewTab>
          <ViewTab active={activeView === 'analytics'} onClick={() => setActiveView('analytics')} style={{ background: activeView === 'analytics' ? 'linear-gradient(135deg, #854CE6, #6c3bbf)' : '' }}>
            <BarChart sx={{ fontSize: 16 }} /> Analytics
          </ViewTab>
        </ViewTabs>
      </div>

      {activeView === 'chat' ? (
        <div style={{ height: 'calc(100vh - 250px)', marginTop: '20px', borderRadius: '12px', overflow: 'hidden', border: `1px solid ${theme.soft}` }}>
          <ChatContainer
            showChat={true}
            setShowChat={() => { }}
            currentChat={projectChat}
            currentUser={currentUser}
            socket={socket}
          />
        </div>
      ) : activeView === 'timeline' ? (
        <ProjectTimeline projectId={id} token={token} />
      ) : activeView === 'github' ? (
        <GitHubFeed projectId={id} githubRepo={item.githubRepo} />
      ) : activeView === 'documents' ? (
        <ProjectDocuments project={item} setProject={setItems} />
      ) : activeView === 'analytics' ? (
        <ProjectAnalytics projectId={id} />
      ) : (
        <MainContent>
          <KanbanBoard>
            {stages.map((stage, index) => {
              if (!stage) return null;
              return (
                <KanbanColumnDrop
                  key={index}
                  status={stage.name}
                  title={stage.name}
                  color={stage.color}
                  icon={<DonutLarge sx={{ color: stage.color }} />}
                  onAdd={index === 0 ? () => setShowAddWork(!showAddWork) : undefined}
                  count={works.filter(w => w.status === stage.name).length}
                  moveWork={moveWork}
                >
                  {/* Create New Work Form / Button - Only for first column */}
                  {index === 0 && showAddWork && (
                    <div style={{ marginBottom: '10px' }}>
                      <AddWork ProjectMembers={members} ProjectId={id} setCreated={setCreated} closeForm={() => setShowAddWork(false)} />
                    </div>
                  )}

                  {works.filter(w => w.status === stage.name).map(work => (
                    <div key={work._id} onClick={() => openWorkDetails(work)} style={{ marginBottom: '16px' }}>
                      <WorkCards status={stage.name} stageColor={stage.color} work={work} deleteWorkLocal={deleteWorkLocal} />
                    </div>
                  ))}
                </KanbanColumnDrop>
              )
            })}
          </KanbanBoard>

          <Sidebar>
            <Widget>
              <WidgetHeader>
                <WidgetTitle>Members</WidgetTitle>
                <IconButton size="small" style={{ color: "white" }} onClick={() => setOpenUpdate({ state: true, type: 'member', data: item })}><Edit fontSize="small" /></IconButton>
              </WidgetHeader>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {members.map((member) => (
                  <MemberCard key={member.id?._id} member={member} />
                ))}
              </div>
            </Widget>

            <Widget>
              <WidgetHeader>
                <WidgetTitle>Tools</WidgetTitle>
                <IconButton size="small" style={{ color: "white" }} onClick={() => setOpenUpdate({ state: true, type: 'tool', data: item })}><Edit fontSize="small" /></IconButton>
              </WidgetHeader>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {item.tools?.map((tool, i) => (
                  <ToolsCard key={i} tool={tool} />
                ))}
              </div>
            </Widget>

            <Widget>
              <WidgetHeader>
                <WidgetTitle>Idea List</WidgetTitle>
                <IconButton size="small" style={{ color: "white" }} onClick={() => setShowAddIdea(!showAddIdea)}>
                  {showAddIdea ? <CancelOutlined fontSize="small" /> : <Add fontSize="small" />}
                </IconButton>
              </WidgetHeader>

              {showAddIdea && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  <TextField
                    size="small"
                    placeholder="Enter new idea..."
                    value={newIdea}
                    onChange={(e) => setNewIdea(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleAddIdea();
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: theme.text,
                        fieldset: { borderColor: theme.soft },
                        '&:hover fieldset': { borderColor: theme.primary },
                        '&.Mui-focused fieldset': { borderColor: theme.primary },
                      },
                      '& .MuiInputBase-input::placeholder': {
                        color: theme.textSoft,
                        opacity: 0.7,
                      },
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Button size="small" variant="text" onClick={() => setShowAddIdea(false)} sx={{ color: theme.textSoft }}>Cancel</Button>
                    <Button size="small" variant="contained" onClick={handleAddIdea} sx={{ backgroundColor: theme.primary, '&:hover': { backgroundColor: theme.primary + 'dd' } }}>Add</Button>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {item.ideas?.map((idea, i) => (
                  <IdeaCard key={i} no={i} idea={idea} removeIdea={handleRemoveIdea} />
                ))}
                {(!item.ideas || item.ideas.length === 0) && !showAddIdea && (
                  <div style={{ fontSize: '13px', color: theme.textSoft, textAlign: 'center', margin: '10px 0' }}>No ideas yet!</div>
                )}
              </div>
            </Widget>
          </Sidebar>
        </MainContent>
      )}
    </Container>
  );
};

export default ProjectDetails;
