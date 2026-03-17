import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled, { useTheme, keyframes, css } from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { Add, TrendingUp, Assignment, Group, AccessTime, ArrowForward, Folder, CheckCircle, Schedule, BarChart } from "@mui/icons-material";
import { Avatar } from "@mui/material";
import { getProjects, userTasks } from "../api";
import { openSnackbar } from "../redux/snackbarSlice";
import { format } from "timeago.js";
import { MagicCard, MagicCardContent, GalaxyButton, PremiumLoader, GlassCard, TagChip, StatusBadge } from "../components/CreativeComponents";
import WorkloadDashboard from "../components/WorkloadDashboard";

// ─── Animations ────────────────────────────────────────────────────────────────

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeInRight = keyframes`
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-8px) rotate(2deg); }
  66% { transform: translateY(-4px) rotate(-1deg); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const countUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ─── Layout ────────────────────────────────────────────────────────────────────

const Container = styled.div`
  padding: 28px 32px;
  background: ${({ theme }) => theme.bg};
  min-height: 100%;
  overflow-x: hidden;
`;

// ─── Hero ──────────────────────────────────────────────────────────────────────

const HeroBanner = styled.div`
  width: 100%;
  border-radius: 24px;
  background: ${({ theme }) => theme.gradientHero || "linear-gradient(120deg, #7C4DFF 0%, #5C3DBF 60%, #3D2B9E 100%)"};
  padding: 36px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(124, 77, 255, 0.4);
  animation: ${fadeInUp} 0.5s ease-out;

  /* Decorative orbs */
  &::before {
    content: "";
    position: absolute;
    top: -60px;
    right: -40px;
    width: 280px;
    height: 280px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50%;
    filter: blur(40px);
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -40px;
    left: 30%;
    width: 180px;
    height: 180px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 50%;
    filter: blur(30px);
  }
`;

const HeroContent = styled.div`
  z-index: 1;
  flex: 1;
`;

const HeroGreeting = styled.div`
  font-size: 13px;
  font-weight: 500;
  opacity: 0.75;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const HeroTitle = styled.h1`
  font-size: 32px;
  font-weight: 800;
  margin: 0 0 12px;
  line-height: 1.2;
  letter-spacing: -0.5px;
`;

const HeroSub = styled.p`
  font-size: 15px;
  opacity: 0.85;
  line-height: 1.6;
  max-width: 480px;
  margin: 0 0 24px;
`;

const HeroActions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const HeroBtn = styled.button`
  padding: 10px 22px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.25s;
  font-family: inherit;

  &.primary {
    background: white;
    color: #7C4DFF;
    border: none;
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
  }

  &.secondary {
    background: rgba(255,255,255,0.15);
    color: white;
    border: 1.5px solid rgba(255,255,255,0.3);
    backdrop-filter: blur(8px);
    &:hover { background: rgba(255,255,255,0.22); transform: translateY(-2px); }
  }
`;

const HeroImage = styled.div`
  font-size: 90px;
  animation: ${float} 6s ease-in-out infinite;
  z-index: 1;
  filter: drop-shadow(0 16px 24px rgba(0,0,0,0.3));

  @media (max-width: 768px) {
    display: none;
  }
`;

// ─── Stats Grid ────────────────────────────────────────────────────────────────

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  animation: ${fadeInUp} 0.6s ease-out ${({ delay }) => delay || "0s"} both;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ accent }) => accent || "linear-gradient(90deg, #7C4DFF, #9C6FFF)"};
    border-radius: 2px 2px 0 0;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px ${({ theme }) => theme.primary + "20"};
    border-color: ${({ theme }) => theme.primary + "50"};
  }
`;

const StatTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const StatIcon = styled.div`
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ bg }) => bg};
  color: white;
  font-size: 22px;
  flex-shrink: 0;
  box-shadow: 0 8px 20px ${({ shadow }) => shadow || "rgba(0,0,0,0.2)"};
`;

const StatLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.textSoft};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.div`
  font-size: 36px;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  line-height: 1;
  animation: ${countUp} 0.5s ease-out;
  letter-spacing: -1px;
`;

const StatNote = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.textMuted || theme.textSoft};
  display: flex;
  align-items: center;
  gap: 4px;
`;

// ─── Section ───────────────────────────────────────────────────────────────────

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  letter-spacing: -0.3px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
`;

const ViewAll = styled.button`
  font-size: 13px;
  color: ${({ theme }) => theme.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
  background: transparent;
  border: none;
  font-family: inherit;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.primary + "15"};
    gap: 8px;
  }
`;

// ─── Project Cards ─────────────────────────────────────────────────────────────

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const ProjectCard = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 20px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: ${fadeInUp} 0.5s ease-out;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: ${({ theme }) => theme.gradientCard || "transparent"};
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 48px ${({ theme }) => theme.primary + "25"};
    border-color: ${({ theme }) => theme.primary + "60"};

    &::after {
      opacity: 1;
    }
  }
`;

const ProjHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
`;

const ProjTitle = styled.h3`
  font-size: 17px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  line-height: 1.4;
  margin: 0;
  transition: color 0.2s;
`;

const ProjDesc = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.textSoft};
  line-height: 1.6;
  margin: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;



const ProjFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const MemberGroup = styled.div`
  display: flex;
  align-items: center;
  padding-left: 8px;
`;

const TimeLabel = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.textMuted || theme.textSoft};
  display: flex;
  align-items: center;
  gap: 4px;
`;

// ─── Empty State ────────────────────────────────────────────────────────────────

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.textSoft};

  .emoji { font-size: 48px; margin-bottom: 16px; display: block; }
  h3 { font-size: 18px; font-weight: 700; color: ${({ theme }) => theme.text}; margin-bottom: 8px; }
  p { font-size: 14px; color: ${({ theme }) => theme.textSoft}; }
`;

// ─── Component ─────────────────────────────────────────────────────────────────

const DashboardNew = ({ setNewProject, setNewTeam }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ projects: [], tasks: [] });
  const { currentUser } = useSelector((state) => state.user);
  const theme = useTheme();
  const dispatch = useDispatch();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

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



  const stats = [
    {
      label: "Total Projects",
      value: totalProjects,
      icon: <Folder />,
      bg: "linear-gradient(135deg, #7C4DFF, #9C6FFF)",
      shadow: "rgba(124,77,255,0.4)",
      accent: "linear-gradient(90deg, #7C4DFF, #9C6FFF)",
      note: "Active workspaces",
      delay: "0.1s"
    },
    {
      label: "Tasks Completed",
      value: completedTasks,
      icon: <CheckCircle />,
      bg: "linear-gradient(135deg, #00E5A0, #00BCD4)",
      shadow: "rgba(0,229,160,0.4)",
      accent: "linear-gradient(90deg, #00E5A0, #00BCD4)",
      note: "Keep it up!",
      delay: "0.2s"
    },
    {
      label: "Pending Tasks",
      value: pendingTasks,
      icon: <Schedule />,
      bg: "linear-gradient(135deg, #FF8A65, #FFD93D)",
      shadow: "rgba(255,138,101,0.4)",
      accent: "linear-gradient(90deg, #FF8A65, #FFD93D)",
      note: "Prioritize these",
      delay: "0.3s"
    },
    {
      label: "Total Tasks",
      value: totalTasks,
      icon: <BarChart />,
      bg: "linear-gradient(135deg, #00D4FF, #0098DB)",
      shadow: "rgba(0,212,255,0.4)",
      accent: "linear-gradient(90deg, #00D4FF, #0098DB)",
      note: "All time",
      delay: "0.4s"
    },
  ];

  return (
    <Container>
      {/* Hero Banner */}
      <HeroBanner>
        <HeroContent>
          <HeroGreeting>👋 {getGreeting()}</HeroGreeting>
          <HeroTitle>{currentUser?.name}!</HeroTitle>
          <HeroSub>
            You have <strong>{pendingTasks} tasks</strong> pending across{" "}
            <strong>{totalProjects} projects</strong>. Let's make today count!
          </HeroSub>
          <HeroActions>
            <HeroBtn className="primary" onClick={() => setNewProject(true)}>
              <Add style={{ fontSize: 18 }} />
              New Project
            </HeroBtn>
            <HeroBtn className="secondary" onClick={() => setNewTeam(true)}>
              <Group style={{ fontSize: 18 }} />
              Build Team
            </HeroBtn>
          </HeroActions>
        </HeroContent>
        <HeroImage>👨‍💻</HeroImage>
      </HeroBanner>

      {/* Stats */}
      <StatsGrid>
        {stats.map((stat, i) => (
          <StatCard key={i} delay={stat.delay} accent={stat.accent}>
            <StatTop>
              <StatLabel>{stat.label}</StatLabel>
              <StatIcon bg={stat.bg} shadow={stat.shadow}>
                {stat.icon}
              </StatIcon>
            </StatTop>
            <StatValue>{loading ? "—" : stat.value}</StatValue>
            <StatNote>{stat.note}</StatNote>
          </StatCard>
        ))}
      </StatsGrid>

      {/* Workload */}
      <WorkloadDashboard />

      {/* Recent Projects */}
      <SectionHeader>
        <SectionTitle>
          <Folder style={{ color: theme.primary, fontSize: 22 }} />
          Recent Projects
        </SectionTitle>
        <ViewAll>
          View All <ArrowForward style={{ fontSize: 15 }} />
        </ViewAll>
      </SectionHeader>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
          <PremiumLoader />
        </div>
      ) : data.projects.length === 0 ? (
        <EmptyState>
          <span className="emoji">🚀</span>
          <h3>No projects yet</h3>
          <p>Create your first project to get started</p>
        </EmptyState>
      ) : (
        <ProjectsGrid>
          {data.projects.slice(0, 6).map((project) => {
            return (
              <Link to={`/projects/${project._id}`} key={project._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <ProjectCard>
                  <ProjHeader>
                    <TagChip color={theme.primary}>{project.tags?.[0] || "Development"}</TagChip>
                    <StatusBadge status={project.status}>{project.status}</StatusBadge>
                  </ProjHeader>

                  <div>
                    <ProjTitle>{project.title}</ProjTitle>
                    <ProjDesc style={{ marginTop: 6 }}>{project.desc}</ProjDesc>
                  </div>

                  <ProjFooter>
                    <MemberGroup>
                      {project.members?.slice(0, 4).map((member, idx) => (
                        <Avatar
                          key={member.id?._id || idx}
                          src={member.id?.img}
                          sx={{
                            width: 28,
                            height: 28,
                            fontSize: 12,
                            border: `2px solid ${theme.bgLighter}`,
                            marginLeft: "-8px",
                            zIndex: 4 - idx
                          }}
                        >
                          {member.id?.name?.[0]}
                        </Avatar>
                      ))}
                      {project.members?.length > 4 && (
                        <div style={{
                          width: 28, height: 28, borderRadius: "50%",
                          background: theme.gradientPrimary || theme.primary,
                          color: "white", display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: 10, fontWeight: "bold",
                          border: `2px solid ${theme.bgLighter}`, marginLeft: -8,
                        }}>
                          +{project.members.length - 4}
                        </div>
                      )}
                    </MemberGroup>
                    <TimeLabel>
                      <AccessTime style={{ fontSize: 12 }} />
                      {format(project.updatedAt)}
                    </TimeLabel>
                  </ProjFooter>
                </ProjectCard>
              </Link>
            );
          })}
        </ProjectsGrid>
      )}
    </Container>
  );
};

export default DashboardNew;
