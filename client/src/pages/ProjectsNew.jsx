import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled, { keyframes, useTheme, css } from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { Add, Search, GridView, ViewList, Folder, AccessTime } from "@mui/icons-material";
import { Avatar, IconButton } from "@mui/material";
import { getProjects, userTasks } from "../api";
import { openSnackbar } from "../redux/snackbarSlice";
import { format } from "timeago.js";
import { GalaxyButton, PremiumLoader, StatusBadge, TagChip } from "../components/CreativeComponents";

// ─── Animations ────────────────────────────────────────────────────────────────

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(0, 194, 224, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(0, 194, 224, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 194, 224, 0); }
`;

// ─── Layout ────────────────────────────────────────────────────────────────────

const Container = styled.div`
  padding: 28px 32px;
  background: ${({ theme }) => theme.bg};
  min-height: 100%;
`;

// ─── Page Header ───────────────────────────────────────────────────────────────

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
  gap: 16px;
  animation: ${fadeInUp} 0.4s ease-out;

  @media (max-width: 680px) {
    flex-direction: column;
  }
`;

const HeaderLeft = styled.div``;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  margin: 0 0 4px;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TitleIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${({ theme }) => theme.gradientPrimary || "linear-gradient(135deg, #7C4DFF, #9C6FFF)"};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  box-shadow: 0 6px 16px ${({ theme }) => theme.primary + "40"};
  flex-shrink: 0;
`;

const PageSubtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft};
  margin: 0;
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-shrink: 0;
`;

// ─── Search & Filters ──────────────────────────────────────────────────────────

const ControlsBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  animation: ${fadeInUp} 0.5s ease-out;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${({ theme }) => theme.bgLighter};
  border: 1.5px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 0 14px;
  height: 40px;
  width: 280px;
  transition: all 0.25s ease;

  &:focus-within {
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.primary + "20"};
  }

  input {
    border: none;
    background: transparent;
    color: ${({ theme }) => theme.text};
    font-size: 14px;
    font-family: inherit;
    outline: none;
    width: 100%;

    &::placeholder { color: ${({ theme }) => theme.textMuted || theme.textSoft}; }
  }

  svg { color: ${({ theme }) => theme.textSoft}; font-size: 18px; flex-shrink: 0; }
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const FilterTab = styled.button`
  padding: 8px 18px;
  border-radius: 50px;
  border: 1.5px solid ${({ $active, theme }) => $active ? theme.primary : theme.border};
  background: ${({ $active, theme }) => $active ? (theme.gradientPrimary || "linear-gradient(135deg, #7C4DFF, #9C6FFF)") : "transparent"};
  color: ${({ $active, theme }) => $active ? "white" : theme.textSoft};
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.25s ease;
  box-shadow: ${({ $active, theme }) => $active ? "0 4px 12px " + theme.primary + "40" : "none"};

  &:hover {
    border-color: ${({ theme }) => theme.primary};
    color: ${({ $active, theme }) => $active ? "white" : theme.primary};
    background: ${({ $active, theme }) => $active ? (theme.gradientPrimary || "linear-gradient(135deg, #7C4DFF, #9C6FFF)") : theme.primary + "10"};
  }
`;

const CountBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 800;
  background: ${({ $active }) => $active ? "rgba(255,255,255,0.3)" : "rgba(124,77,255,0.15)"};
  color: ${({ $active }) => $active ? "white" : "#7C4DFF"};
  margin-left: 4px;
`;

const ViewToggle = styled.div`
  display: flex;
  border: 1.5px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  overflow: hidden;
  margin-left: auto;
`;

const ViewBtn = styled.button`
  padding: 6px 10px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  background: ${({ $active, theme }) => $active ? theme.primary + "20" : "transparent"};
  color: ${({ $active, theme }) => $active ? theme.primary : theme.textSoft};

  &:hover { background: ${({ theme }) => theme.itemHover}; }

  svg { font-size: 17px; display: block; }
`;

// ─── Project Grid ──────────────────────────────────────────────────────────────

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: ${({ $listView }) => $listView ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))"};
  gap: 18px;
`;

const ProjectCard = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 20px;
  padding: 22px;
  display: flex;
  flex-direction: ${({ $listView }) => $listView ? "row" : "column"};
  gap: ${({ $listView }) => $listView ? "20px" : "14px"};
  cursor: pointer;
  transition: all 0.3s ease;
  animation: ${fadeInUp} 0.4s ease-out;
  text-decoration: none;
  color: inherit;
  align-items: ${({ $listView }) => $listView ? "center" : "stretch"};

  &:hover {
    transform: ${({ $listView }) => $listView ? "translateX(4px)" : "translateY(-5px)"};
    box-shadow: 0 16px 40px ${({ theme }) => theme.primary + "20"};
    border-color: ${({ theme }) => theme.primary + "60"};
  }
`;

const ProjIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: ${({ theme }) => theme.gradientPrimary || "linear-gradient(135deg, #7C4DFF, #9C6FFF)"};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  flex-shrink: 0;
  box-shadow: 0 6px 16px ${({ theme }) => theme.primary + "35"};
`;

const ProjContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

const ProjHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
`;

const ProjTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProjDesc = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.textSoft};
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProjMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: ${({ $listView }) => $listView ? "0" : "10px"};
  border-top: ${({ $listView, theme }) => $listView ? "none" : `1px solid ${theme.border}`};
  margin-top: auto;
`;

const MemberGroup = styled.div`
  display: flex;
  align-items: center;
  padding-left: 8px;
`;

const TimeStamp = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.textMuted || theme.textSoft};
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
`;

// ─── Empty State ───────────────────────────────────────────────────────────────

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: ${({ theme }) => theme.textSoft};

  .emoji { font-size: 56px; margin-bottom: 20px; display: block; }
  h3 { font-size: 20px; font-weight: 700; color: ${({ theme }) => theme.text}; margin-bottom: 8px; }
  p { font-size: 15px; margin: 0 0 24px; }
`;

// ─── Stats Bar ─────────────────────────────────────────────────────────────────

const StatsBar = styled.div`
  display: flex;
  gap: 24px;
  padding: 16px 24px;
  background: ${({ theme }) => theme.bgLighter};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  margin-bottom: 24px;
  animation: ${fadeInUp} 0.5s ease-out;
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StatDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ color }) => color};
  box-shadow: 0 0 8px ${({ color }) => color + "80"};
`;

const StatText = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  span {
    font-size: 12px;
    font-weight: 400;
    color: ${({ theme }) => theme.textSoft};
    margin-left: 4px;
  }
`;

// ─── Component ─────────────────────────────────────────────────────────────────

const ProjectsNew = ({ setNewProject }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const [data, setData] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [listView, setListView] = useState(false);
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



  const filteredData = Array.isArray(data) ? data.filter(project => {
    if (!project) return false;
    const matchesFilter = filter === "All" || project.status === filter;
    const matchesSearch = project.title?.toLowerCase().includes(search.toLowerCase()) || false;
    return matchesFilter && matchesSearch;
  }) : [];

  const tabs = [
    { label: "All", count: data.length },
    { label: "Working", count: data.filter(p => p.status === "Working").length },
    { label: "In Progress", count: data.filter(p => p.status === "In Progress").length },
    { label: "Completed", count: data.filter(p => p.status === "Completed").length },
  ];

  const completedCount = data.filter(p => p.status === "Completed").length;
  const activeCount = data.filter(p => p.status === "Working" || p.status === "In Progress").length;

  return (
    <Container>
      {/* Header */}
      <PageHeader>
        <HeaderLeft>
          <PageTitle>
            <TitleIcon><AccountTreeRounded /></TitleIcon>
            My Projects
          </PageTitle>
          <PageSubtitle>Track and manage all your projects in one place</PageSubtitle>
        </HeaderLeft>
        <HeaderRight>
          <GalaxyButton onClick={() => setNewProject(true)}>
            <Add style={{ fontSize: 18 }} /> New Project
          </GalaxyButton>
        </HeaderRight>
      </PageHeader>

      {/* Stats Bar */}
      {!loading && (
        <StatsBar>
          <StatItem>
            <StatDot color="#7C4DFF" />
            <StatText>{data.length} <span>Total</span></StatText>
          </StatItem>
          <StatItem>
            <StatDot color="#00D4FF" />
            <StatText>{activeCount} <span>Active</span></StatText>
          </StatItem>
          <StatItem>
            <StatDot color="#00E5A0" />
            <StatText>{completedCount} <span>Done</span></StatText>
          </StatItem>
          {data.length > 0 && (
            <StatItem style={{ marginLeft: 'auto' }}>
              <StatText style={{ color: theme.textSoft, fontWeight: 400, fontSize: 12 }}>
                {Math.round((completedCount / data.length) * 100)}% completion rate
              </StatText>
            </StatItem>
          )}
        </StatsBar>
      )}

      {/* Controls */}
      <ControlsBar>
        <SearchBox>
          <Search />
          <input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </SearchBox>

        <FilterTabs>
          {tabs.map(tab => (
            <FilterTab
              key={tab.label}
              $active={filter === tab.label}
              onClick={() => setFilter(tab.label)}
            >
              {tab.label}
              <CountBadge $active={filter === tab.label}>{tab.count}</CountBadge>
            </FilterTab>
          ))}
        </FilterTabs>

        <ViewToggle>
          <ViewBtn $active={!listView} onClick={() => setListView(false)}>
            <GridView />
          </ViewBtn>
          <ViewBtn $active={listView} onClick={() => setListView(true)}>
            <ViewList />
          </ViewBtn>
        </ViewToggle>
      </ControlsBar>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
          <PremiumLoader />
        </div>
      ) : filteredData.length === 0 ? (
        <EmptyState>
          <span className="emoji">{search || filter !== "All" ? "🔍" : "📁"}</span>
          <h3>{search || filter !== "All" ? "No results found" : "No projects yet"}</h3>
          <p>
            {search || filter !== "All"
              ? "Try adjusting your search or filters"
              : "Create your first project to get started"
            }
          </p>
          {!search && filter === "All" && (
            <GalaxyButton onClick={() => setNewProject(true)}>
              <Add style={{ fontSize: 18 }} /> Create Project
            </GalaxyButton>
          )}
        </EmptyState>
      ) : (
        <ProjectsGrid $listView={listView}>
          {filteredData.map((project) => {
            return (
              <ProjectCard
                as={Link}
                to={`/projects/${project._id}`}
                key={project._id}
                $listView={listView}
              >
                <ProjIcon>
                  <Folder />
                </ProjIcon>

                <ProjContent>
                  <ProjHeader>
                    <ProjTitle>{project.title}</ProjTitle>
                    <StatusBadge status={project.status}>{project.status}</StatusBadge>
                  </ProjHeader>

                  {!listView && (
                    <ProjDesc>{project.desc || "No description provided."}</ProjDesc>
                  )}

                  <ProjMeta $listView={listView}>
                    <MemberGroup>
                      {project.members?.slice(0, 4).map((member, idx) => (
                        <Avatar
                          key={member._id || idx}
                          src={member.img}
                          sx={{
                            width: 26, height: 26, fontSize: 11,
                            border: `2px solid ${theme.bgLighter}`,
                            marginLeft: "-8px",
                            zIndex: 4 - idx
                          }}
                        >
                          {member.name?.[0]}
                        </Avatar>
                      ))}
                      {project.members?.length > 4 && (
                        <div style={{
                          width: 26, height: 26, borderRadius: "50%",
                          background: theme.gradientPrimary || theme.primary,
                          color: "white", display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: 9, fontWeight: "bold",
                          border: `2px solid ${theme.bgLighter}`, marginLeft: -8,
                        }}>
                          +{project.members.length - 4}
                        </div>
                      )}
                    </MemberGroup>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {listView && (
                        <TagChip color={theme.primary}>{project.tags?.[0] || "Dev"}</TagChip>
                      )}
                      <TimeStamp>
                        <AccessTime style={{ fontSize: 11 }} />
                        {project.updatedAt ? format(project.updatedAt) : 'Recently'}
                      </TimeStamp>
                    </div>
                  </ProjMeta>
                </ProjContent>
              </ProjectCard>
            );
          })}
        </ProjectsGrid>
      )}
    </Container>
  );
};

// Missing import fix
import { AccountTreeRounded } from "@mui/icons-material";

export default ProjectsNew;
