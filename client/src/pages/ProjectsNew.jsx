import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled, { keyframes, useTheme, css } from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { Add, Search, FilterList, Sort } from "@mui/icons-material";
import { CircularProgress, Avatar, LinearProgress, IconButton } from "@mui/material";
import { getProjects, userTasks } from "../api";
import { openSnackbar } from "../redux/snackbarSlice";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { format } from "timeago.js";
import { MagicCard, GalaxyButton, PremiumLoader, PremiumProgress } from "../components/CreativeComponents";

// --- Animations ---
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  padding: 30px;
  background-color: ${({ theme }) => theme.bg};
  height: 100%;
  overflow-y: scroll;
  /* Creative Background w/ Radial Gradient Glows */
  background: 
    radial-gradient(circle at 10% 20%, ${({ theme }) => theme.bgLighter} 0%, transparent 20%),
    radial-gradient(circle at 90% 80%, ${({ theme }) => theme.primary + "15"} 0%, transparent 20%),
    
    radial-gradient(${({ theme }) => theme.textSoft + "10"} 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 30px 30px;
  background-attachment: local;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  animation: ${fadeInUp} 0.6s ease-out;
  background: ${({ theme }) => theme.bgLighter};
  padding: 20px 30px;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.soft + "20"};
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h1`
  font-size: 34px;
  font-weight: 800;
  background: linear-gradient(to right, ${({ theme }) => theme.text}, ${({ theme }) => theme.primary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -1px;
  display: flex;
  align-items: center;
  gap: 10px;

  &::before {
    content: "⚡"; /* Simple icon for flair */
    -webkit-text-fill-color: initial;
    font-size: 30px;
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const SearchBar = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border: 1px solid ${({ theme }) => theme.soft};
  border-radius: 12px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 300px;
  transition: all 0.3s;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);

  &:focus-within {
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 15px ${({ theme }) => theme.primary + "30"};
    transform: translateY(-2px);
  }

  input {
    border: none;
    background: transparent;
    color: ${({ theme }) => theme.text};
    width: 100%;
    font-size: 14px;
    outline: none;

    &::placeholder {
      color: ${({ theme }) => theme.textSoft};
    }
  }
`;

const Tabs = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 30px;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const Tab = styled.button`
  padding: 10px 24px;
  border-radius: 50px; /* Pill shape */
  border: none;
  background: ${({ active, theme }) => active ? "linear-gradient(135deg, #854CE6 0%, #6A38C2 100%)" : theme.bgLighter};
  color: ${({ active, theme }) => active ? "white" : theme.textSoft};
  font-weight: 700;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: ${({ active }) => active ? "0 8px 16px rgba(133, 76, 230, 0.25)" : "0 2px 4px rgba(0,0,0,0.02)"};
  position: relative;
  overflow: hidden;

  /* Shine effect on hover */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s ease;
  }

  &:hover {
    transform: translateY(-3px) scale(1.05);
    color: ${({ active, theme }) => active ? "white" : theme.text};
    background: ${({ active, theme }) => active ? "linear-gradient(135deg, #854CE6 0%, #6A38C2 100%)" : theme.soft};
    
    &::before {
      left: 100%;
    }
  }
`;

// Reuse the Premium Card from Dashboard
const ProjectCardNew = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid ${({ theme }) => theme.soft + "50"};
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation: ${fadeInUp} 0.5s ease-out;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0,0,0,0.12);
    border-color: ${({ theme }) => theme.primary};
    &::before {
      opacity: 1;
    }
  }
`;

const ProjectHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
`;

const Tag = styled.span`
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${({ color }) => color + "20"};
  color: ${({ color }) => color};
  box-shadow: 0 0 10px ${({ color }) => color + "40"};
  border: 1px solid ${({ color }) => color + "40"};
`;

const ProjectTitle = styled.h3`
    font-size: 22px;
    font-weight: 700;
    color: ${({ theme }) => theme.text};
    margin-bottom: 8px;
    line-height: 1.4;
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
        color: ${({ theme }) => theme.primary};
    }
`;

const MemberGroup = styled.div`
  display: flex;
  align-items: center;
  padding-left: 10px;
  &:hover > div {
      margin-left: -5px;
      transition: margin 0.3s ease;
  }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(0, 194, 224, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(0, 194, 224, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 194, 224, 0); }
`;

const StatusBadge = styled.span`
    font-size: 12px;
    padding: 4px 12px;
    border-radius: 20px;
    background: ${({ status }) => {
    if (status === 'Completed') return 'rgba(76, 175, 80, 0.1)';
    if (status === 'In Progress') return 'rgba(0, 194, 224, 0.1)';
    return 'rgba(235, 90, 70, 0.1)';
  }};
    color: ${({ status }) => {
    if (status === 'Completed') return '#4caf50';
    if (status === 'In Progress') return '#00C2E0';
    return '#EB5A46';
  }};
    border: 1px solid ${({ status }) => {
    if (status === 'Completed') return '#4caf50';
    if (status === 'In Progress') return '#00C2E0';
    return '#EB5A46';
  }};
    font-weight: 700;
    
    /* Pulse animation for active statuses */
    animation: ${({ status }) => status === 'In Progress' ? css`${pulse} 2s infinite` : 'none'};
`;

const ProjectsNew = ({ setNewProject }) => { // Accepting setNewProject prop to maintain compatibility
  const dispatch = useDispatch();

  const theme = useTheme();
  const [data, setData] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const [projRes, taskRes] = await Promise.all([
          getProjects(token),
          userTasks(token)
        ]);
        setData(projRes.data);
        setTasks(taskRes.data);
        setLoading(false);
      } catch (err) {
        dispatch(openSnackbar({ message: err.response?.data?.message || err.message, type: "error" }));
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser, dispatch]);

  const getProgress = (projectId, status) => {
    if (status === "Completed") return 100;

    const projectTasks = tasks.filter(t => t.projectId === projectId);
    if (projectTasks.length === 0) {
      return 0;
    }

    const completedCount = projectTasks.filter(t => t.status === "Completed" || t.status === "Done").length;
    return Math.round((completedCount / projectTasks.length) * 100);
  };

  const filteredData = Array.isArray(data) ? data.filter(project => {
    if (!project) return false;
    const matchesFilter = filter === "All" || project.status === filter;
    const matchesSearch = project.title ? project.title.toLowerCase().includes(search.toLowerCase()) : false;
    return matchesFilter && matchesSearch;
  }) : [];

  console.log("Projects Data:", data);

  return (
    <Container>
      <Header>
        <Title>My Projects</Title>
        <Controls>
          <SearchBar>
            <Search style={{ color: theme.textSoft }} />
            <input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </SearchBar>
          <GalaxyButton onClick={() => setNewProject(true)} style={{ padding: '10px 20px', fontSize: '14px' }}>
            <Add style={{ fontSize: "18px" }} /> New Project
          </GalaxyButton>
        </Controls>
      </Header>

      <Tabs>
        {["All", "Working", "In Progress", "Completed"].map((tab) => (
          <Tab
            key={tab}
            active={filter === tab}
            onClick={() => setFilter(tab)}
          >
            {tab}
          </Tab>
        ))}
      </Tabs>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", width: "100%", padding: '40px' }}>
          <PremiumLoader />
        </div>
      ) : (
        <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
          <Masonry gutter="24px">
            {filteredData.map((project) => (
              <Link to={`/projects/${project._id}`} key={project._id} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <ProjectCardNew style={{ cursor: "pointer" }}>
                  <ProjectHeader>
                    <Tag color={theme.primary}>{project.tags?.[0] || "Development"}</Tag>
                    <StatusBadge status={project.status}>{project.status}</StatusBadge>
                  </ProjectHeader>

                  <div>
                    <ProjectTitle>{project.title}</ProjectTitle>
                    <p style={{ fontSize: "14px", color: theme.textSoft, lineHeight: "1.6" }}>
                      {project.desc?.length > 100 ? project.desc.slice(0, 100) + "..." : project.desc}
                    </p>
                  </div>



                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: `1px solid ${theme.soft}` }}>
                    <MemberGroup>
                      {project.members?.slice(0, 3).map((member) => (
                        <Avatar
                          key={member._id}
                          src={member.img}
                          sx={{ width: 32, height: 32, border: `2px solid ${theme.bgLighter}`, marginLeft: "-10px" }}
                        />
                      ))}
                      {project.members?.length > 3 && (
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: theme.primary,
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "10px",
                            border: `2px solid ${theme.bgLighter}`,
                            marginLeft: "-10px",
                            fontWeight: "bold",
                          }}
                        >
                          +{project.members.length - 3}
                        </div>
                      )}
                    </MemberGroup>
                    <span style={{ fontSize: '12px', color: theme.textSoft }}>{project.updatedAt ? format(project.updatedAt) : 'Recently'}</span>
                  </div>
                </ProjectCardNew>
              </Link>
            ))}
          </Masonry>
        </ResponsiveMasonry>
      )}
    </Container>
  );
};

export default ProjectsNew;
