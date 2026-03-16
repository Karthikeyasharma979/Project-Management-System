import React, { useEffect, useState, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { useSelector } from "react-redux";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { getProjectAnalytics, aiSprintPlanner } from "../api/index";
import {
    TrendingUp,
    CheckCircle,
    Cancel,
    AccessTime,
    Bolt,
    Person,
    AutoAwesome,
    Refresh,
} from "@mui/icons-material";
import { CircularProgress, Avatar, Tooltip as MuiTooltip, LinearProgress } from "@mui/material";

// ─── Animations ──────────────────────────────────────────────────────────────
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// ─── Styled Components ────────────────────────────────────────────────────────
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: ${fadeInUp} 0.5s ease-out;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border: 1px solid ${({ theme }) => theme.soft};
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ accent }) => accent || "#854CE6"};
    border-radius: 16px 16px 0 0;
  }
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${({ accent }) => accent + "20" || "#854CE620"};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ accent }) => accent || "#854CE6"};
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.textSoft};
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ChartSection = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border: 1px solid ${({ theme }) => theme.soft};
  border-radius: 16px;
  padding: 24px;
`;

const ChartTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MemberList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MemberRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.soft + "50"};
`;

const MemberInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const MemberName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MemberRole = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.textSoft};
`;

const MemberProgress = styled.div`
  width: 80px;
  text-align: right;
`;

const MemberStat = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.textSoft};
  margin-bottom: 4px;
`;

const HealthScore = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: ${({ theme }) => theme.bgLighter};
  border: 1px solid ${({ theme }) => theme.soft};
  border-radius: 16px;
`;

const HealthCircle = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
`;

const HealthScoreValue = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 800;
  color: ${({ score }) =>
        score >= 70 ? "#10B981" : score >= 40 ? "#F59E0B" : "#EF4444"};
`;

const HealthLabel = styled.div`
  flex: 1;
`;

const HealthTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin-bottom: 4px;
`;

const HealthDesc = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.textSoft};
  line-height: 1.5;
`;

const SprintPlanBox = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border: 1px solid ${({ theme }) => theme.soft};
  border-radius: 16px;
  padding: 24px;
`;

const SprintCard = styled.div`
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.soft};
  border-left: 4px solid ${({ color }) => color};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
`;

const SprintName = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin-bottom: 6px;
`;

const SprintGoal = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.textSoft};
  font-style: italic;
  margin-bottom: 10px;
`;

const SprintDetail = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-bottom: 4px;

  &::before {
    content: '•';
    color: ${({ color }) => color};
    flex-shrink: 0;
    font-size: 14px;
    line-height: 1.2;
  }
`;

const ActionBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #854CE6, #6c3bbf);
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(133, 76, 230, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingOverlay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  flex-direction: column;
  gap: 12px;
  color: ${({ theme }) => theme.textSoft};
  font-size: 14px;
`;

// ─── Colors ───────────────────────────────────────────────────────────────────
const CHART_COLORS = ["#854CE6", "#10B981", "#F59E0B", "#3B82F6", "#EF4444", "#EC4899"];
const SPRINT_COLORS = ["#854CE6", "#10B981", "#F59E0B"];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltipStyle = styled.div`
  background: #1a1a2e;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 12px;
  color: #fff;
`;

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <CustomTooltipStyle>
            <div style={{ fontWeight: 700, marginBottom: 4, color: "#aaa" }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color, marginBottom: 2 }}>
                    {p.name}: <strong>{p.value}</strong>
                </div>
            ))}
        </CustomTooltipStyle>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ProjectAnalytics = ({ projectId }) => {
    const token = localStorage.getItem("token");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sprintPlan, setSprintPlan] = useState(null);
    const [sprintLoading, setSprintLoading] = useState(false);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getProjectAnalytics(projectId, token);
            setData(res.data);
        } catch (err) {
            console.error("Analytics fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [projectId, token]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const handleGenerateSprintPlan = async () => {
        setSprintLoading(true);
        try {
            const res = await aiSprintPlanner(projectId, token);
            setSprintPlan(res.data);
        } catch (err) {
            console.error("Sprint planner error:", err);
        } finally {
            setSprintLoading(false);
        }
    };

    if (loading) {
        return (
            <LoadingOverlay>
                <CircularProgress size={32} sx={{ color: "#854CE6" }} />
                <span>Crunching analytics...</span>
            </LoadingOverlay>
        );
    }

    if (!data) return null;

    const { overview, burndownData, weeklyActivity, statusDistribution, memberStats } = data;

    const getHealthLabel = (score) => {
        if (score >= 70) return { label: "Healthy", color: "#10B981", desc: "Project is progressing well. Keep the momentum going!" };
        if (score >= 40) return { label: "At Risk", color: "#F59E0B", desc: "Some delays detected. Consider re-prioritizing tasks." };
        return { label: "Critical", color: "#EF4444", desc: "Project needs immediate attention. Schedule a team sync." };
    };

    const health = getHealthLabel(overview.healthScore);

    return (
        <Container>
            {/* ── Overview Stats ─────────────────────────────────────────────── */}
            <StatsGrid>
                <StatCard accent="#854CE6">
                    <StatIcon accent="#854CE6"><TrendingUp fontSize="small" /></StatIcon>
                    <StatValue>{overview.completionRate}%</StatValue>
                    <StatLabel>Completion Rate</StatLabel>
                </StatCard>
                <StatCard accent="#10B981">
                    <StatIcon accent="#10B981"><CheckCircle fontSize="small" /></StatIcon>
                    <StatValue>{overview.completedTasks}</StatValue>
                    <StatLabel>Tasks Completed</StatLabel>
                </StatCard>
                <StatCard accent="#3B82F6">
                    <StatIcon accent="#3B82F6"><Bolt fontSize="small" /></StatIcon>
                    <StatValue>{overview.activeTasks}</StatValue>
                    <StatLabel>Active Tasks</StatLabel>
                </StatCard>
                <StatCard accent="#F59E0B">
                    <StatIcon accent="#F59E0B"><AccessTime fontSize="small" /></StatIcon>
                    <StatValue>{Math.round(overview.totalTimeTracked / 60)}h</StatValue>
                    <StatLabel>Time Tracked</StatLabel>
                </StatCard>
                <StatCard accent="#EF4444">
                    <StatIcon accent="#EF4444"><Cancel fontSize="small" /></StatIcon>
                    <StatValue>{overview.cancelledTasks}</StatValue>
                    <StatLabel>Cancelled</StatLabel>
                </StatCard>
                <StatCard accent="#EC4899">
                    <StatIcon accent="#EC4899"><Person fontSize="small" /></StatIcon>
                    <StatValue>{overview.totalWorks}</StatValue>
                    <StatLabel>Work Groups</StatLabel>
                </StatCard>
            </StatsGrid>

            {/* ── Health Score ───────────────────────────────────────────────── */}
            <HealthScore>
                <HealthCircle>
                    <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="#333" strokeWidth="8" />
                        <circle
                            cx="40"
                            cy="40"
                            r="34"
                            fill="none"
                            stroke={health.color}
                            strokeWidth="8"
                            strokeDasharray={`${(overview.healthScore / 100) * 213.6} 213.6`}
                            strokeLinecap="round"
                            transform="rotate(-90 40 40)"
                        />
                    </svg>
                    <HealthScoreValue score={overview.healthScore}>{overview.healthScore}</HealthScoreValue>
                </HealthCircle>
                <HealthLabel>
                    <HealthTitle>Project Health: <span style={{ color: health.color }}>{health.label}</span></HealthTitle>
                    <HealthDesc>{health.desc}</HealthDesc>
                </HealthLabel>
                <ActionBtn onClick={fetchAnalytics}><Refresh fontSize="small" /> Refresh</ActionBtn>
            </HealthScore>

            {/* ── Burndown + Pie Charts ──────────────────────────────────────── */}
            <ChartSection>
                <ChartCard>
                    <ChartTitle>
                        <TrendingUp fontSize="small" style={{ color: "#854CE6" }} />
                        Burndown Chart (Last 14 Days)
                    </ChartTitle>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={burndownData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="remaining" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#854CE6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#854CE6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="completed" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis dataKey="date" tick={{ fill: "#888", fontSize: 10 }} tickLine={false} />
                            <YAxis tick={{ fill: "#888", fontSize: 10 }} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 12, color: "#888" }} />
                            <Area type="monotone" dataKey="remaining" stroke="#854CE6" fill="url(#remaining)" name="Remaining" strokeWidth={2} />
                            <Area type="monotone" dataKey="completed" stroke="#10B981" fill="url(#completed)" name="Completed" strokeWidth={2} />
                            <Area type="monotone" dataKey="ideal" stroke="#F59E0B" fill="none" name="Ideal" strokeDasharray="4 4" strokeWidth={1.5} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard>
                    <ChartTitle>
                        <CheckCircle fontSize="small" style={{ color: "#10B981" }} />
                        Task Status
                    </ChartTitle>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={statusDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={85}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {statusDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ fontSize: 12, color: "#888" }}
                                formatter={(value) => <span style={{ color: "#aaa" }}>{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
            </ChartSection>

            {/* ── Weekly Activity ────────────────────────────────────────────── */}
            <ChartCard>
                <ChartTitle>
                    <Bolt fontSize="small" style={{ color: "#F59E0B" }} />
                    Weekly Activity (Tasks Created vs Completed)
                </ChartTitle>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={weeklyActivity} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="day" tick={{ fill: "#888", fontSize: 11 }} tickLine={false} />
                        <YAxis tick={{ fill: "#888", fontSize: 11 }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 12, color: "#888" }} />
                        <Bar dataKey="created" fill="#854CE6" name="Created" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="completed" fill="#10B981" name="Completed" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* ── Member Performance ─────────────────────────────────────────── */}
            {memberStats.length > 0 && (
                <ChartCard>
                    <ChartTitle>
                        <Person fontSize="small" style={{ color: "#3B82F6" }} />
                        Member Performance
                    </ChartTitle>
                    <MemberList>
                        {memberStats.map((member) => {
                            const rate = member.assigned > 0
                                ? Math.round((member.completed / member.assigned) * 100)
                                : 0;
                            return (
                                <MemberRow key={member.id}>
                                    <Avatar src={member.img} alt={member.name} sx={{ width: 36, height: 36 }} />
                                    <MemberInfo>
                                        <MemberName>{member.name}</MemberName>
                                        <MemberRole>{member.role}</MemberRole>
                                        <LinearProgress
                                            variant="determinate"
                                            value={rate}
                                            sx={{
                                                mt: 0.5,
                                                height: 4,
                                                borderRadius: 2,
                                                bgcolor: "#ffffff15",
                                                "& .MuiLinearProgress-bar": {
                                                    bgcolor: rate >= 70 ? "#10B981" : rate >= 40 ? "#F59E0B" : "#854CE6",
                                                },
                                            }}
                                        />
                                    </MemberInfo>
                                    <MemberProgress>
                                        <MemberStat style={{ color: "#10B981", fontWeight: 700 }}>{member.completed} done</MemberStat>
                                        <MemberStat>{member.active} active</MemberStat>
                                        <MemberStat style={{ color: "#888" }}>{Math.round(member.timeTracked / 60)}h tracked</MemberStat>
                                    </MemberProgress>
                                </MemberRow>
                            );
                        })}
                    </MemberList>
                </ChartCard>
            )}

            {/* ── AI Sprint Planner ──────────────────────────────────────────── */}
            <SprintPlanBox>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <ChartTitle style={{ marginBottom: 0 }}>
                        <AutoAwesome fontSize="small" style={{ color: "#854CE6" }} />
                        AI Sprint Planner
                    </ChartTitle>
                    <ActionBtn onClick={handleGenerateSprintPlan} disabled={sprintLoading}>
                        {sprintLoading
                            ? <><CircularProgress size={14} sx={{ color: "white" }} /> Generating...</>
                            : <><AutoAwesome fontSize="small" /> Generate Plan</>}
                    </ActionBtn>
                </div>

                {!sprintPlan && !sprintLoading && (
                    <div style={{ textAlign: "center", padding: "30px", color: "#666", fontSize: "14px" }}>
                        Click <strong style={{ color: "#854CE6" }}>Generate Plan</strong> to get an AI-powered sprint breakdown for your project.
                    </div>
                )}

                {sprintPlan && (
                    <>
                        {sprintPlan.sprints.map((sprint, i) => (
                            <SprintCard key={i} color={SPRINT_COLORS[i % SPRINT_COLORS.length]}>
                                <SprintName>{sprint.name} <span style={{ color: "#666", fontSize: "12px", fontWeight: 400 }}>({sprint.durationWeeks}w)</span></SprintName>
                                <SprintGoal>🎯 {sprint.goal}</SprintGoal>
                                <div style={{ marginBottom: "8px" }}>
                                    {sprint.focusAreas.map((area, j) => (
                                        <SprintDetail key={j} color={SPRINT_COLORS[i % SPRINT_COLORS.length]}>{area}</SprintDetail>
                                    ))}
                                </div>
                                <div style={{ fontSize: "12px", color: "#10B981", fontWeight: 600 }}>
                                    Deliverables: {sprint.deliverables.join(" • ")}
                                </div>
                            </SprintCard>
                        ))}
                        <div style={{ marginTop: "12px", padding: "12px", background: "#854CE620", borderRadius: "10px", fontSize: "13px", color: "#854CE6" }}>
                            💡 {sprintPlan.recommendation}
                        </div>
                    </>
                )}
            </SprintPlanBox>
        </Container>
    );
};

export default ProjectAnalytics;
