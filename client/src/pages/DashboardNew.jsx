import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled, { useTheme, keyframes, css } from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { Add, TrendingUp, Assignment, Group, AccessTime, ArrowForward } from "@mui/icons-material";
import { CircularProgress, Avatar, LinearProgress } from "@mui/material";
import { getProjects, userTasks } from "../api";
import { openSnackbar } from "../redux/snackbarSlice";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { format } from "timeago.js";
import { MagicCard, MagicCardContent, GalaxyButton, PremiumLoader, PremiumProgress } from "../components/CreativeComponents";
import WorkloadDashboard from "../components/WorkloadDashboard";

// --- Animations ---
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const Container = styled.div`
  padding: 30px;
  background-color: ${({ theme }) => theme.bg};
  height: 100%;
  overflow-y: scroll;
  
  /* Subtle Grid Background */
  background-image: radial-gradient(${({ theme }) => theme.textSoft + "20"} 1px, transparent 1px);
  background-size: 20px 20px;
`;

// --- Hero Section ---
const HeroBanner = styled.div`
  width: 100%;
  border-radius: 24px;
  background: linear-gradient(120deg, #854CE6 0%, #6A38C2 100%);
  padding: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(133, 76, 230, 0.3);
  animation: ${fadeInUp} 0.6s ease-out;

  &::before {
    content: "";
    position: absolute;
    top: -50px;
    right: -50px;
    width: 300px;
    height: 300px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    filter: blur(50px);
  }
  
    &::after {
    content: "";
    position: absolute;
    bottom: -30px;
    left: 50px;
    width: 150px;
    height: 150px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50%;
    filter: blur(30px);
  }
`;

const HeroContent = styled.div`
  z-index: 1;
`;

const WelcomeText = styled.h1`
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 12px;
  line-height: 1.2;
`;

const SubText = styled.p`
  font-size: 16px;
  opacity: 0.9;
  max-width: 500px;
  line-height: 1.6;
`;

const HeroImage = styled.div`
  font-size: 100px;
  animation: ${float} 6s ease-in-out infinite;
  @media (max-width: 768px) {
    display: none;
  }
`;

// --- Stats Section ---
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
  animation: ${fadeInUp} 0.8s ease-out;
`;


const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
`;

const IconBox = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  background: ${({ bg }) => bg};
  color: white;
  box-shadow: 0 8px 16px ${({ bg }) => bg + "60"};
`;

const StatValue = styled.span`
  font-size: 32px;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  margin-top: 10px;
  display: block;
`;

const StatLabel = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft};
  font-weight: 500;
`;

// --- Actions ---
const Actions = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 40px;
  animation: ${fadeInUp} 1s ease-out;
`;


// --- Projects ---
const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center; /* Better alignment */
  margin-bottom: 24px;
  position: relative;
  padding-bottom: 10px;

  /* Decorative underline */
  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 4px;
    background: ${({ theme }) => theme.primary};
    border-radius: 2px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 26px; /* Slightly larger */
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  letter-spacing: -0.5px;
`;

const ViewAll = styled.span`
    font-size: 14px;
    color: ${({ theme }) => theme.primary};
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px; /* Increased gap */
    font-weight: 700; /* Bolder */
    transition: all 0.2s;

    &:hover {
        color: ${({ theme }) => theme.text};
        transform: translateX(4px);
    }
`;

const ProjectCardNew = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05); /* Softer shadow */
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid ${({ theme }) => theme.soft + "50"}; /* More transparent border */
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* Bouncy transition */
  animation: ${fadeInUp} 1.2s ease-out;
  position: relative;
  overflow: hidden;

  /* Glass/Gradient overlay on hover */
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
    font-size: 22px; /* Increased size */
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
  
  /* Stack effect hover capability */
  &:hover > div {
      margin-left: -5px; /* Spreads them out slightly */
      transition: margin 0.3s ease;
  }
`;

const DashboardNew = ({ setNewProject, setNewTeam }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ projects: [], tasks: [] });
    const { currentUser } = useSelector((state) => state.user);
    const theme = useTheme();
    const dispatch = useDispatch();



    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const projectsRes = await getProjects(token);
                const tasksRes = await userTasks(token);
                setData({ projects: projectsRes.data, tasks: tasksRes.data });
                setLoading(false);
            } catch (err) {
                dispatch(openSnackbar({ message: err.response?.data?.message || err.message, type: "error" }));
                setLoading(false);
            }
        };
        fetchData();
    }, [currentUser, dispatch]);

    const totalProjects = data.projects.length;
    const totalTasks = data.tasks.length;
    const completedTasks = data.tasks.filter((t) => t.status === "Completed" || t.status === "Done").length;
    const pendingTasks = data.tasks.filter((t) => t.status !== "Completed" && t.status !== "Done").length;

    // Helper for visual progress bar
    const getProgress = (projectId, status) => {
        if (status === "Completed") return 100;

        const projectTasks = data.tasks.filter(t => t.projectId === projectId);
        if (projectTasks.length === 0) {
            return 0;
        }

        const completedCount = projectTasks.filter(t => t.status === "Completed" || t.status === "Done").length;
        return Math.round((completedCount / projectTasks.length) * 100);
    };

    return (
        <Container>
            <HeroBanner>
                <HeroContent>
                    <WelcomeText>Good Evening, {currentUser?.name}! 🚀</WelcomeText>
                    <SubText>
                        You've got <b>{pendingTasks} tasks</b> pending and <b>{data.projects.length} active projects</b>.
                        Let's crush your goals today!
                    </SubText>
                </HeroContent>
                <HeroImage>👨‍💻</HeroImage>
            </HeroBanner>

            <StatsGrid>
                <MagicCard>
                    <MagicCardContent>
                        <CardHeader>
                            <IconBox bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
                                <Assignment />
                            </IconBox>
                            <StatLabel>Total Projects</StatLabel>
                        </CardHeader>
                        <div>
                            <StatValue>{totalProjects}</StatValue>
                        </div>
                    </MagicCardContent>
                </MagicCard>
                <MagicCard>
                    <MagicCardContent>
                        <CardHeader>
                            <IconBox bg="linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)">
                                <TrendingUp />
                            </IconBox>
                            <StatLabel>Completed</StatLabel>
                        </CardHeader>
                        <div>
                            <StatValue>{completedTasks}</StatValue>
                            <SubText style={{ fontSize: '12px', marginTop: '4px' }}>Great progress!</SubText>
                        </div>
                    </MagicCardContent>
                </MagicCard>
                <MagicCard>
                    <MagicCardContent>
                        <CardHeader>
                            <IconBox bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
                                <Group />
                            </IconBox>
                            <StatLabel>Pending Tasks</StatLabel>
                        </CardHeader>
                        <div>
                            <StatValue>{pendingTasks}</StatValue>
                            <SubText style={{ fontSize: '12px', marginTop: '4px' }}>Prioritize these</SubText>
                        </div>
                    </MagicCardContent>
                </MagicCard>
                <MagicCard>
                    <MagicCardContent>
                        <CardHeader>
                            <IconBox bg="linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)">
                                <AccessTime />
                            </IconBox>
                            <StatLabel>Total Tasks</StatLabel>
                        </CardHeader>
                        <div>
                            <StatValue>{totalTasks}</StatValue>
                            <SubText style={{ fontSize: '12px', marginTop: '4px' }}>Keep tracking</SubText>
                        </div>
                    </MagicCardContent>
                </MagicCard>
            </StatsGrid>

            <WorkloadDashboard />

            <Actions>
                <GalaxyButton onClick={() => setNewProject(true)}>
                    <Add style={{ fontSize: "22px" }} />
                    Start New Project
                </GalaxyButton>
                <GalaxyButton style={{ background: 'linear-gradient(90deg, #FFC107, #FF9800)' }} onClick={() => setNewTeam(true)}>
                    <Add style={{ fontSize: "22px" }} />
                    Build Team
                </GalaxyButton>
            </Actions>

            <SectionHeader>
                <SectionTitle>Recent Projects</SectionTitle>
                <ViewAll onClick={() => dispatch(openSnackbar({ message: "Navigating to all projects...", type: "default" }))}>
                    View All <ArrowForward style={{ fontSize: 16 }} />
                </ViewAll>
            </SectionHeader>

            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", width: "100%", padding: '40px' }}>
                    <PremiumLoader />
                </div>
            ) : (
                <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
                    <Masonry gutter="24px">
                        {data.projects.map((project) => (
                            <Link to={`/projects/${project._id}`} key={project._id} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                                <ProjectCardNew style={{ cursor: "pointer" }}>
                                    <ProjectHeader>
                                        <Tag color={theme.primary}>{project.tags?.[0] || "Development"}</Tag>
                                        <span style={{ fontSize: "12px", color: theme.textSoft, fontWeight: 500 }}>
                                            {format(project.updatedAt)}
                                        </span>
                                    </ProjectHeader>

                                    <div>
                                        <ProjectTitle>{project.title}</ProjectTitle>
                                        <p style={{ fontSize: "14px", color: theme.textSoft, lineHeight: "1.6" }}>
                                            {project.desc?.length > 80 ? project.desc.slice(0, 80) + "..." : project.desc}
                                        </p>
                                    </div>



                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: `1px solid ${theme.soft}` }}>
                                        <MemberGroup>
                                            {project.members?.slice(0, 3).map((member) => (
                                                <Avatar
                                                    key={member.id?._id}
                                                    src={member.id?.img}
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
                                        <span style={{ fontSize: '12px', color: theme.textSoft }}>Due shortly</span>
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

export default DashboardNew;
