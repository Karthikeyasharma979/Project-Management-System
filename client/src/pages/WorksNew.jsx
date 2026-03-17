import React, { useState, useEffect } from "react";
import styled, { keyframes, useTheme } from "styled-components";
import { Avatar, Chip, LinearProgress } from "@mui/material";
import {
  CheckCircleOutline, DonutLarge, CalendarToday, Assignment,
  AccessTime, TrendingUp, MoreHoriz, WorkOutline, TaskAlt
} from "@mui/icons-material";
import { GalaxyButton, PremiumLoader, StatusBadge, GlassCard } from "../components/CreativeComponents";
import { useDispatch, useSelector } from "react-redux";
import { openSnackbar } from "../redux/snackbarSlice";
import { userWorks, userTasks } from "../api";

// ─── Animations ────────────────────────────────────────────────────────────────

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-12px); }
  to { opacity: 1; transform: translateX(0); }
`;

// ─── Layout ────────────────────────────────────────────────────────────────────

const Container = styled.div`
  padding: 28px 32px;
  background: ${({ theme }) => theme.bg};
  min-height: 100%;
`;

// ─── Header ────────────────────────────────────────────────────────────────────

const PageHeader = styled.div`
  margin-bottom: 28px;
  animation: ${fadeInUp} 0.4s ease-out;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 6px;
`;

const TitleIcon = styled.div`
  width: 42px;
  height: 42px;
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

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  margin: 0;
  letter-spacing: -0.5px;
`;

const PageSubtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft};
  margin: 0;
`;

// ─── Stats Grid ────────────────────────────────────────────────────────────────

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
  margin-bottom: 32px;
  animation: ${fadeInUp} 0.5s ease-out;
`;

const StatCard = styled.div`
  background: ${({ theme, $accent }) => $accent ? $accent : theme.bgLighter};
  border: 1px solid ${({ theme, $accent }) => $accent ? "transparent" : theme.border};
  border-radius: 20px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: ${({ $topAccent }) => $topAccent || "transparent"};
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px ${({ theme }) => theme.primary + "18"};
  }
`;

const StatIconBox = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: ${({ $bg }) => $bg || "rgba(124,77,255,0.15)"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: ${({ $color }) => $color || "#7C4DFF"};
`;

const StatLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${({ $light }) => $light ? "rgba(255,255,255,0.7)" : ({ theme }) => theme?.textSoft};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.div`
  font-size: 36px;
  font-weight: 800;
  color: ${({ $light, theme }) => $light ? "white" : theme.text};
  line-height: 1;
  letter-spacing: -1px;
`;

const StatProgress = styled.div`
  height: 5px;
  background: ${({ theme }) => theme.border};
  border-radius: 10px;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0; left: 0;
    height: 100%;
    width: ${({ $value }) => $value || 0}%;
    background: ${({ $bar }) => $bar || "linear-gradient(90deg, #7C4DFF, #9C6FFF)"};
    border-radius: 10px;
    transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

// ─── Section ───────────────────────────────────────────────────────────────────

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
`;

const SectionTitle = styled.h2`
  font-size: 17px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0;
  letter-spacing: -0.2px;
`;

const SectionBadge = styled.span`
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  background: ${({ $color }) => $color + "20" || "rgba(124,77,255,0.15)"};
  color: ${({ $color }) => $color || "#7C4DFF"};
  border: 1px solid ${({ $color }) => $color + "40" || "rgba(124,77,255,0.3)"};
`;

// ─── Works Grid ────────────────────────────────────────────────────────────────

const WorksLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  margin-bottom: 40px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const WorkColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const WorkCard = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 18px;
  padding: 20px;
  transition: all 0.3s ease;
  animation: ${slideIn} 0.5s ease-out;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px ${({ theme }) => theme.primary + "18"};
    border-color: ${({ theme }) => theme.primary + "50"};
  }
`;

const WorkHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
`;

const WorkTitle = styled.h4`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0 0 4px;
`;

const WorkDate = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.textSoft};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const WorkStatusRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  margin-bottom: 6px;
  color: ${({ theme }) => theme.textSoft};
  font-weight: 500;
`;

const MemberGroup = styled.div`
  display: flex;
  padding-left: 8px;
`;

const WorkFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const ChipStyled = styled.div`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  background: ${({ $bg }) => $bg || "rgba(124,77,255,0.12)"};
  color: ${({ $color }) => $color || "#7C4DFF"};
  border: 1px solid ${({ $border }) => $border || "rgba(124,77,255,0.25)"};
`;

const EmptyColumn = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.textSoft};
  font-size: 14px;

  .icon { font-size: 36px; margin-bottom: 8px; display: block; }
`;

// ─── Tasks Table ──────────────────────────────────────────────────────────────

const TaskSection = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 20px;
  overflow: hidden;
  animation: ${fadeInUp} 0.7s ease-out;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 44px 1fr 120px 120px 100px;
  align-items: center;
  padding: 14px 24px;
  background: ${({ theme }) => theme.bg};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: ${({ theme }) => theme.textSoft};

  @media (max-width: 768px) {
    grid-template-columns: 1fr 100px;
    > *:not(:nth-child(2)):not(:last-child) { display: none; }
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 44px 1fr 120px 120px 100px;
  align-items: center;
  padding: 14px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  font-size: 13px;
  color: ${({ theme }) => theme.text};
  transition: background 0.15s;

  &:last-child { border-bottom: none; }

  &:hover { background: ${({ theme }) => theme.itemHover}; }

  @media (max-width: 768px) {
    grid-template-columns: 1fr 100px;
    > *:not(:nth-child(2)):not(:last-child) { display: none; }
  }
`;

const RowIndex = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.textMuted || theme.textSoft};
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: ${({ theme }) => theme.soft};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TaskName = styled.span`
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 8px;
`;

const DateCell = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.textSoft};
`;

const OverdueDate = styled(DateCell)`
  color: ${({ theme }) => theme.red || "#FF5252"};
  font-weight: 600;
`;

const EmptyRow = styled.div`
  text-align: center;
  padding: 48px;
  color: ${({ theme }) => theme.textSoft};
  font-size: 14px;
`;

// ─── Component ─────────────────────────────────────────────────────────────────

const WorksNew = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [works, setWorks] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const [worksRes, tasksRes] = await Promise.all([
          userWorks(token),
          userTasks(token)
        ]);
        setWorks(worksRes.data);
        setTasks(tasksRes.data);
        setLoading(false);
      } catch (err) {
        dispatch(openSnackbar({
          message: err.response?.data?.message || err.message || "Failed to fetch data",
          type: "error"
        }));
        setLoading(false);
      }
    };

    if (currentUser) fetchData();
  }, [currentUser, dispatch]);

  const completedWorks = works.filter(w => w.status === "Completed");
  const pendingWorks = works.filter(w => w.status === "Working" || w.status === "In Progress");
  const pendingTasksCount = tasks.filter(t => t.status !== "Completed" && t.status !== "Done").length;
  const completionRate = works.length > 0 ? Math.round((completedWorks.length / works.length) * 100) : 0;

  const isOverdue = (dateStr) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  return (
    <Container>
      {/* Header */}
      <PageHeader>
        <TitleRow>
          <TitleIcon>
            <WorkOutline />
          </TitleIcon>
          <PageTitle>My Works</PageTitle>
        </TitleRow>
        <PageSubtitle>Track your ongoing works, tasks, and personal contributions</PageSubtitle>
      </PageHeader>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
          <PremiumLoader />
        </div>
      ) : (
        <>
          {/* Stats */}
          <StatsGrid>
            <StatCard $topAccent="linear-gradient(90deg, #7C4DFF, #9C6FFF)">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <StatLabel>Total Works</StatLabel>
                  <StatValue style={{ marginTop: 8 }}>{works.length}</StatValue>
                </div>
                <StatIconBox $bg="rgba(124,77,255,0.12)" $color={theme.primary}>
                  <DonutLarge />
                </StatIconBox>
              </div>
              <StatProgress
                $value={completionRate}
                $bar="linear-gradient(90deg, #7C4DFF, #9C6FFF)"
              />
              <span style={{ fontSize: 11, color: theme.textSoft, fontWeight: 500 }}>
                {completionRate}% completion rate
              </span>
            </StatCard>

            <StatCard $topAccent="linear-gradient(90deg, #FF8A65, #FFD93D)">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <StatLabel>Pending Tasks</StatLabel>
                  <StatValue style={{ marginTop: 8 }}>{pendingTasksCount}</StatValue>
                </div>
                <StatIconBox $bg="rgba(255,138,101,0.12)" $color="#FF8A65">
                  <Assignment />
                </StatIconBox>
              </div>
              <span style={{ fontSize: 12, color: theme.textSoft }}>
                {pendingTasksCount === 0 ? "🎉 All caught up!" : "Stay on track!"}
              </span>
            </StatCard>

            <StatCard
              $accent="linear-gradient(135deg, #7C4DFF 0%, #5C3DBF 100%)"
              style={{ color: 'white' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <StatLabel $light>Completed</StatLabel>
                  <StatValue $light style={{ marginTop: 8 }}>{completedWorks.length}</StatValue>
                </div>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "rgba(255,255,255,0.2)",
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                }}>
                  <CheckCircleOutline />
                </div>
              </div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                {completedWorks.length === 0 ? "Complete your first!" : "Great progress! 🚀"}
              </span>
            </StatCard>
          </StatsGrid>

          {/* Works (In Progress vs Completed) */}
          <WorksLayout>
            <WorkColumn>
              <SectionHeader>
                <DonutLarge style={{ color: '#00D4FF', fontSize: 20 }} />
                <SectionTitle>In Progress</SectionTitle>
                <SectionBadge $color="#00D4FF">{pendingWorks.length}</SectionBadge>
              </SectionHeader>

              {pendingWorks.length === 0 ? (
                <EmptyColumn>
                  <span className="icon">✨</span>
                  No active works
                </EmptyColumn>
              ) : (
                pendingWorks.map((work) => (
                  <WorkCard key={work._id}>
                    <WorkHeader>
                      <div>
                        <WorkTitle>{work.title}</WorkTitle>
                        <WorkDate>
                          <CalendarToday style={{ fontSize: 11 }} />
                          {new Date(work.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </WorkDate>
                      </div>
                      <ChipStyled $bg="rgba(0,212,255,0.1)" $color="#00D4FF" $border="rgba(0,212,255,0.25)">
                        Active
                      </ChipStyled>
                    </WorkHeader>

                    <WorkStatusRow>
                      <span>Progress</span>
                      <span style={{ color: '#00D4FF', fontWeight: 700 }}>60%</span>
                    </WorkStatusRow>
                    <LinearProgress
                      variant="determinate"
                      value={60}
                      sx={{
                        borderRadius: 4, height: 5,
                        backgroundColor: theme.soft,
                        '& .MuiLinearProgress-bar': { backgroundColor: '#00D4FF', borderRadius: 4 }
                      }}
                    />

                    <WorkFooter>
                      <MemberGroup>
                        {work.members?.slice(0, 3).map((m, i) => (
                          <Avatar
                            key={m._id || i}
                            src={m.img}
                            sx={{ width: 26, height: 26, marginLeft: '-8px', border: `2px solid ${theme.bgLighter}`, fontSize: 11 }}
                          >
                            {m.name?.[0]}
                          </Avatar>
                        ))}
                      </MemberGroup>
                      <ChipStyled $bg="rgba(0,212,255,0.08)" $color="#00D4FF" $border="rgba(0,212,255,0.2)">
                        On Track
                      </ChipStyled>
                    </WorkFooter>
                  </WorkCard>
                ))
              )}
            </WorkColumn>

            <WorkColumn>
              <SectionHeader>
                <CheckCircleOutline style={{ color: '#00E5A0', fontSize: 20 }} />
                <SectionTitle>Completed</SectionTitle>
                <SectionBadge $color="#00E5A0">{completedWorks.length}</SectionBadge>
              </SectionHeader>

              {completedWorks.length === 0 ? (
                <EmptyColumn>
                  <span className="icon">🏁</span>
                  No completed works yet
                </EmptyColumn>
              ) : (
                completedWorks.map((work) => (
                  <WorkCard key={work._id} style={{ opacity: 0.85 }}>
                    <WorkHeader>
                      <div>
                        <WorkTitle>{work.title}</WorkTitle>
                        <WorkDate>
                          <CalendarToday style={{ fontSize: 11 }} />
                          {new Date(work.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </WorkDate>
                      </div>
                      <ChipStyled $bg="rgba(0,229,160,0.1)" $color="#00E5A0" $border="rgba(0,229,160,0.25)">
                        Done
                      </ChipStyled>
                    </WorkHeader>

                    <WorkStatusRow>
                      <span>Completed</span>
                      <span style={{ color: '#00E5A0', fontWeight: 700 }}>100%</span>
                    </WorkStatusRow>
                    <LinearProgress
                      variant="determinate"
                      value={100}
                      sx={{
                        borderRadius: 4, height: 5,
                        backgroundColor: theme.soft,
                        '& .MuiLinearProgress-bar': { backgroundColor: '#00E5A0', borderRadius: 4 }
                      }}
                    />

                    <WorkFooter>
                      <MemberGroup>
                        {work.members?.slice(0, 3).map((m, i) => (
                          <Avatar
                            key={m._id || i}
                            src={m.img}
                            sx={{ width: 26, height: 26, marginLeft: '-8px', border: `2px solid ${theme.bgLighter}`, fontSize: 11 }}
                          >
                            {m.name?.[0]}
                          </Avatar>
                        ))}
                      </MemberGroup>
                      <TaskAlt style={{ color: '#00E5A0', fontSize: 18 }} />
                    </WorkFooter>
                  </WorkCard>
                ))
              )}
            </WorkColumn>
          </WorksLayout>

          {/* Tasks Table */}
          <SectionHeader style={{ marginBottom: 16 }}>
            <Assignment style={{ color: theme.primary, fontSize: 20 }} />
            <SectionTitle>Your Tasks</SectionTitle>
            <SectionBadge $color={theme.primary}>{tasks.length}</SectionBadge>
          </SectionHeader>

          <TaskSection>
            <TableHeader>
              <span>#</span>
              <span>Task Name</span>
              <span>Start Date</span>
              <span>Deadline</span>
              <span>Status</span>
            </TableHeader>

            {tasks.length === 0 ? (
              <EmptyRow>No tasks assigned to you yet.</EmptyRow>
            ) : (
              tasks.map((task, index) => (
                <TableRow key={task._id}>
                  <RowIndex>{index + 1}</RowIndex>
                  <TaskName>{task.task}</TaskName>
                  <DateCell>
                    {task.createdAt ? new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                  </DateCell>
                  {isOverdue(task.end_date) && (task.status !== 'Completed' && task.status !== 'Done') ? (
                    <OverdueDate>
                      {task.end_date ? new Date(task.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                    </OverdueDate>
                  ) : (
                    <DateCell>
                      {task.end_date ? new Date(task.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                    </DateCell>
                  )}
                  <StatusBadge status={task.status}>{task.status}</StatusBadge>
                </TableRow>
              ))
            )}
          </TaskSection>
        </>
      )}
    </Container>
  );
};

export default WorksNew;
