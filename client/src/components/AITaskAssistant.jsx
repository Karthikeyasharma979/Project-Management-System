import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { aiGenerateTask } from "../api/index";
import {
  AutoAwesome,
  Close,
  ContentCopy,
  CheckCircle,
  Timer,
  Flag,
  Label,
  FormatListBulleted,
} from "@mui/icons-material";
import { CircularProgress, Tooltip } from "@mui/material";

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -300% 0; }
  100% { background-position: 300% 0; }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(133,76,230,0.4); }
  50% { box-shadow: 0 0 16px 4px rgba(133,76,230,0.2); }
`;

// ─── Styled Components ────────────────────────────────────────────────────────
const Wrapper = styled.div`
  position: relative;
  width: 100%;
`;

const TriggerBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #854CE640;
  background: #854CE612;
  color: #854CE6;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: #854CE620;
    border-color: #854CE680;
    animation: ${glow} 1s ease-in-out;
  }

  &:disabled {
    opacity: 0.7;
    cursor: wait;
  }
`;

const Panel = styled.div`
  position: absolute;
  z-index: 1000;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #1a1a2e;
  border: 1px solid #854CE640;
  border-radius: 14px;
  padding: 16px;
  animation: ${fadeIn} 0.2s ease-out;
  box-shadow: 0 12px 40px rgba(0,0,0,0.5);
  min-width: 340px;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
`;

const PanelTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: color 0.15s;
  
  &:hover { color: #999; }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px;
  color: #666;
  font-size: 13px;
`;

const ShimmerText = styled.div`
  width: ${({ width }) => width || "100%"};
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(90deg, #333 25%, #444 50%, #333 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  margin-bottom: 8px;
`;

const ResultSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 340px;
  overflow-y: auto;
  
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #444; border-radius: 2px; }
`;

const Section = styled.div`
  background: #0d0d1a;
  border: 1px solid #2a2a4a;
  border-radius: 10px;
  padding: 12px;
`;

const SectionLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: ${({ color }) => color || "#666"};
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SectionText = styled.div`
  font-size: 13px;
  color: #ccc;
  line-height: 1.6;
`;

const SubtaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SubtaskItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  color: #ccc;
  
  &::before {
    content: '→';
    color: #854CE6;
    flex-shrink: 0;
    font-size: 13px;
    line-height: 1.4;
  }
`;

const MetaRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const MetaBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ bg }) => bg || "#333"};
  color: ${({ color }) => color || "#ccc"};
  border: 1px solid ${({ border }) => border || "#444"};
`;

const TagChip = styled.div`
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  background: #854CE620;
  color: #854CE6;
  border: 1px solid #854CE640;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 4px;
`;

const ApplyBtn = styled.button`
  flex: 1;
  padding: 8px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #854CE6, #6c3bbf);
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(133, 76, 230, 0.4);
  }
`;

const CopyBtn = styled.button`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #333;
  background: transparent;
  color: #888;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    border-color: #555;
    color: #ccc;
  }
`;

// ─── Priority Config ──────────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
  Low: { color: "#10B981", bg: "#10B98120", border: "#10B98140" },
  Medium: { color: "#F59E0B", bg: "#F59E0B20", border: "#F59E0B40" },
  High: { color: "#EF4444", bg: "#EF444420", border: "#EF444440" },
  Critical: { color: "#FF0080", bg: "#FF008020", border: "#FF008040" },
};

// ─── Main Component ───────────────────────────────────────────────────────────
/**
 * AITaskAssistant
 * Props:
 *   taskTitle  - the current task title input value
 *   projectId  - the project context for better AI suggestions
 *   onApply    - callback(result) called when user clicks "Apply to Task"
 */
const AITaskAssistant = ({ taskTitle, projectId, onApply }) => {
  const token = localStorage.getItem("token");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [noTitleError, setNoTitleError] = useState(false);

  const handleGenerate = async () => {
    setOpen(true);
    setNoTitleError(false);

    if (!taskTitle?.trim()) {
      setNoTitleError(true);
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await aiGenerateTask(taskTitle, projectId, token);
      setResult(res.data);
    } catch (err) {
      console.error("AI Task generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (result && onApply) {
      onApply(result);
      setOpen(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `${result.description}\n\nSubtasks:\n${result.subtasks.map(s => `• ${s}`).join("\n")}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const priorityConf = result ? (PRIORITY_CONFIG[result.priority] || PRIORITY_CONFIG.Medium) : null;

  return (
    <Wrapper>
      <TriggerBtn
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        title={taskTitle?.trim() ? "Generate task details with AI" : "Click to get AI help (type a title first)"}
      >
        {loading
          ? <CircularProgress size={12} sx={{ color: "#854CE6" }} />
          : <AutoAwesome sx={{ fontSize: 14 }} />}
        AI Assist
      </TriggerBtn>

      {open && (
        <Panel>
          <PanelHeader>
            <PanelTitle>
              <AutoAwesome sx={{ fontSize: 14, color: "#854CE6" }} />
              AI Task Assistant
            </PanelTitle>
            <CloseBtn type="button" onClick={() => setOpen(false)}>
              <Close sx={{ fontSize: 16 }} />
            </CloseBtn>
          </PanelHeader>

          {/* No Title Error State */}
          {noTitleError && !loading && !result && (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              padding: "20px",
              textAlign: "center"
            }}>
              <AutoAwesome sx={{ fontSize: 28, color: "#854CE6" }} />
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>AI Task Assistant</div>
              <div style={{
                fontSize: "12px",
                color: "#aaa",
                background: "#1a0a2e",
                border: "1px dashed #854CE640",
                borderRadius: "8px",
                padding: "12px 16px",
                lineHeight: 1.6
              }}>
                ✏️ Please <strong style={{ color: "#854CE6" }}>type a task title</strong> first in the
                <br />"Title card" field above, then click <strong style={{ color: "#854CE6" }}>AI Assist</strong> again.
              </div>
              <div style={{ fontSize: "11px", color: "#555" }}>Example: "Implement login page" or "Fix payment bug"</div>
            </div>
          )}

          {loading && (
            <LoadingState>
              <CircularProgress size={24} sx={{ color: "#854CE6" }} />
              <span>Generating smart task details...</span>
              <div style={{ width: "100%" }}>
                <ShimmerText width="90%" />
                <ShimmerText width="75%" />
                <ShimmerText width="60%" />
              </div>
            </LoadingState>
          )}

          {result && !loading && (
            <>
              <ResultSection>
                <Section>
                  <SectionLabel color="#854CE6">
                    <AutoAwesome sx={{ fontSize: 10 }} /> Description
                  </SectionLabel>
                  <SectionText>{result.description}</SectionText>
                </Section>

                <Section>
                  <SectionLabel color="#10B981">
                    <FormatListBulleted sx={{ fontSize: 10 }} /> Subtasks
                  </SectionLabel>
                  <SubtaskList>
                    {result.subtasks.map((s, i) => (
                      <SubtaskItem key={i}>{s}</SubtaskItem>
                    ))}
                  </SubtaskList>
                </Section>

                <Section>
                  <SectionLabel color="#F59E0B">
                    <Timer sx={{ fontSize: 10 }} /> Estimates & Priority
                  </SectionLabel>
                  <MetaRow>
                    <MetaBadge bg="#3B82F620" color="#3B82F6" border="#3B82F640">
                      <Timer sx={{ fontSize: 12 }} /> ~{result.estimatedHours}h
                    </MetaBadge>
                    {priorityConf && (
                      <MetaBadge bg={priorityConf.bg} color={priorityConf.color} border={priorityConf.border}>
                        <Flag sx={{ fontSize: 12 }} /> {result.priority}
                      </MetaBadge>
                    )}
                  </MetaRow>
                  {result.tags?.length > 0 && (
                    <MetaRow style={{ marginTop: "8px" }}>
                      {result.tags.map((tag, i) => (
                        <TagChip key={i}><Label sx={{ fontSize: 10, mr: 0.3 }} />{tag}</TagChip>
                      ))}
                    </MetaRow>
                  )}
                </Section>
              </ResultSection>

              <ActionRow>
                <ApplyBtn type="button" onClick={handleApply}>
                  <CheckCircle sx={{ fontSize: 14 }} /> Apply to Task
                </ApplyBtn>
                <CopyBtn type="button" onClick={handleCopy}>
                  {copied ? <CheckCircle sx={{ fontSize: 14, color: "#10B981" }} /> : <ContentCopy sx={{ fontSize: 14 }} />}
                  {copied ? "Copied!" : "Copy"}
                </CopyBtn>
              </ActionRow>
            </>
          )}
        </Panel>
      )}
    </Wrapper>
  );
};

export default AITaskAssistant;
