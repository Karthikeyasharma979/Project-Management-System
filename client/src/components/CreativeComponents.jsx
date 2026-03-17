import styled, { keyframes, css } from "styled-components";

// ─── Animations ──────────────────────────────────────────────────────────────

const rot = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const shine = keyframes`
  0% { left: -150px; }
  20% { left: 100%; }
  100% { left: 100%; }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(0.95); }
`;

const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-16px); }
  to { opacity: 1; transform: translateX(0); }
`;

// ─── Magic Card (Rotating Gradient Border) ───────────────────────────────────

export const MagicCard = styled.div`
  width: 100%;
  position: relative;
  border-radius: 20px;
  background: ${({ theme }) => theme.bgCard};
  padding: 1.5px;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadowCard};
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: ${fadeInUp} 0.5s ease-out;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadowHover};
  }

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(
      transparent,
      ${({ theme }) => theme.primary},
      transparent 30%
    );
    animation: ${rot} 4s linear infinite;
    z-index: 0;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 1.5px;
    background: ${({ theme }) => theme.bgCard};
    border-radius: 18.5px;
    z-index: 1;
  }
`;

export const MagicCardContent = styled.div`
  position: relative;
  z-index: 2;
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

// ─── Galaxy Button ────────────────────────────────────────────────────────────

export const GalaxyButton = styled.button`
  position: relative;
  padding: 13px 28px;
  border-radius: 14px;
  border: none;
  color: white;
  cursor: pointer;
  background: ${({ theme }) => theme.gradientPrimary};
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.3px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(124, 77, 255, 0.35);
  font-family: inherit;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -150px;
    width: 60px;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transform: skewX(-20deg);
    animation: ${shine} 3.5s infinite;
  }

  &:hover {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 12px 32px rgba(124, 77, 255, 0.5);
  }

  &:active {
    transform: scale(0.97);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

// ─── Outline Button ───────────────────────────────────────────────────────────

export const OutlineButton = styled.button`
  position: relative;
  padding: 11px 24px;
  border-radius: 12px;
  border: 1.5px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  background: transparent;
  font-weight: 600;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.25s ease;
  font-family: inherit;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.primary};
    background: ${({ theme }) => theme.primary + "12"};
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.97);
  }
`;

// ─── Premium Loader ───────────────────────────────────────────────────────────

export const PremiumLoader = styled.div`
  width: 44px;
  height: 44px;
  border: 3px solid ${({ theme }) => theme.border};
  border-radius: 50%;
  border-top-color: ${({ theme }) => theme.primary};
  animation: ${spin} 0.8s ease-in-out infinite;
  box-shadow: 0 0 20px ${({ theme }) => theme.primary + "40"};
`;

// ─── Premium Progress Bar ─────────────────────────────────────────────────────

export const PremiumProgress = styled.div`
  width: 100%;
  height: 6px;
  background: ${({ theme }) => theme.soft};
  border-radius: 10px;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${({ value }) => value || 0}%;
    background: ${({ theme }) => theme.gradientPrimary};
    border-radius: 10px;
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 8px ${({ theme }) => theme.primary + "60"};
  }
`;

// ─── Premium Glass Card ───────────────────────────────────────────────────────

export const GlassCard = styled.div`
  background: ${({ theme }) => theme.bgCard};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 20px;
  padding: ${({ padding }) => padding || "24px"};
  box-shadow: ${({ theme }) => theme.shadowCard};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  animation: ${fadeInUp} 0.5s ease-out;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${({ theme }) => theme.primary + "40"}, transparent);
  }

  ${({ hoverable }) => hoverable && css`
    cursor: pointer;
    &:hover {
      transform: translateY(-4px);
      box-shadow: ${({ theme }) => theme.shadowHover};
      border-color: ${({ theme }) => theme.primary + "60"};
    }
  `}
`;

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

export const Skeleton = styled.div`
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.soft} 25%,
    ${({ theme }) => theme.bgCard} 50%,
    ${({ theme }) => theme.soft} 75%
  );
  background-size: 400px 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: ${({ radius }) => radius || "8px"};
  height: ${({ height }) => height || "16px"};
  width: ${({ width }) => width || "100%"};
`;

// ─── Status Badge ─────────────────────────────────────────────────────────────

export const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 50px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;

  background: ${({ status, theme }) => {
    if (status === 'Completed' || status === 'Done') return 'rgba(0, 229, 160, 0.12)';
    if (status === 'In Progress' || status === 'Working') return 'rgba(0, 212, 255, 0.12)';
    if (status === 'Pending') return 'rgba(255, 138, 101, 0.12)';
    return theme.soft + "40";
  }};

  color: ${({ status, theme }) => {
    if (status === 'Completed' || status === 'Done') return '#00E5A0';
    if (status === 'In Progress' || status === 'Working') return '#00D4FF';
    if (status === 'Pending') return '#FF8A65';
    return theme.textSoft;
  }};

  border: 1px solid ${({ status, theme }) => {
    if (status === 'Completed' || status === 'Done') return 'rgba(0, 229, 160, 0.3)';
    if (status === 'In Progress' || status === 'Working') return 'rgba(0, 212, 255, 0.3)';
    if (status === 'Pending') return 'rgba(255, 138, 101, 0.3)';
    return theme.border;
  }};

  &::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
    display: inline-block;
  }
`;

// ─── Section Header ───────────────────────────────────────────────────────────

export const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  letter-spacing: -0.3px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.border};
    display: ${({ noLine }) => noLine ? 'none' : 'block'};
  }
`;

// ─── Tag Chip ─────────────────────────────────────────────────────────────────

export const TagChip = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${({ color, theme }) => (color || theme.primary) + "18"};
  color: ${({ color, theme }) => color || theme.primary};
  border: 1px solid ${({ color, theme }) => (color || theme.primary) + "35"};
`;

// ─── Tooltip ─────────────────────────────────────────────────────────────────

export const Tooltip = styled.div`
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: ${({ theme }) => theme.bgCard};
  color: ${({ theme }) => theme.text};
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: ${({ theme }) => theme.shadowCard};
  border: 1px solid ${({ theme }) => theme.border};
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 100;
`;
