import React, { useEffect } from "react";
import { useState } from "react";
import styled, { keyframes, css } from "styled-components";
import { Link, useLocation } from "react-router-dom";
import {
  Add,
  CloseRounded,
  Groups2Rounded,
  Logout,
  WorkspacesRounded,
  Public,
  AccountTreeRounded,
  DashboardRounded,
  AddTaskRounded,
  SettingsBrightnessOutlined,
} from "@mui/icons-material";
import { tagColors } from "../data/data";
import LogoIcon from "../Images/Logo.svg";
import { useDispatch } from "react-redux";
import { logout } from "../redux/userSlice";
import { openSnackbar } from "../redux/snackbarSlice";
import { useSelector } from "react-redux";
import { getUsers } from "../api/index";
import { useNavigate } from 'react-router-dom';
import { Avatar, CircularProgress } from "@mui/material";

// ─── Animations ──────────────────────────────────────────────────────────────

const fadeInLeft = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
`;

// ─── Styles ───────────────────────────────────────────────────────────────────

const Container = styled.div`
  width: 240px;
  min-width: 240px;
  background: ${({ theme }) => theme.bgLighter};
  height: 100vh;
  border-right: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  z-index: 100;
  animation: ${fadeInLeft} 0.3s ease-out;

  @media (max-width: 1100px) {
    position: fixed;
    z-index: 200;
    left: ${({ setMenuOpen }) => (setMenuOpen ? "0" : "-260px")};
    box-shadow: ${({ setMenuOpen }) => setMenuOpen ? "8px 0 32px rgba(0,0,0,0.4)" : "none"};
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const LogoWrap = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;
`;

const LogoIconWrap = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.gradientPrimary || "linear-gradient(135deg, #7C4DFF, #9C6FFF)"};
  padding: 4px;
  box-shadow: 0 4px 12px ${({ theme }) => theme.primary + "50"};
`;

const LogoImg = styled.img`
  width: 22px;
  height: 22px;
  filter: brightness(0) invert(1);
`;

const LogoText = styled.span`
  font-size: 18px;
  font-weight: 800;
  background: ${({ theme }) => theme.gradientPrimary || "linear-gradient(135deg, #7C4DFF, #9C6FFF)"};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
`;

const CloseBtn = styled.button`
  display: none;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.textSoft};
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.soft};
    color: ${({ theme }) => theme.text};
  }

  @media (max-width: 1100px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const NavSection = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px 12px;

  &::-webkit-scrollbar { width: 3px; }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.soft};
    border-radius: 4px;
  }
`;

const NavLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${({ theme }) => theme.textMuted || theme.textSoft};
  padding: 12px 10px 6px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  text-decoration: none;
  color: ${({ $active, theme }) => $active ? "white" : theme.itemText};
  background: ${({ $active, theme }) => $active ? theme.gradientPrimary || "linear-gradient(135deg, #7C4DFF, #9C6FFF)" : "transparent"};
  font-weight: ${({ $active }) => $active ? "600" : "500"};
  font-size: 14px;
  transition: all 0.2s ease;
  position: relative;
  margin-bottom: 2px;
  box-shadow: ${({ $active, theme }) => $active ? "0 4px 16px " + (theme.primary || "#7C4DFF") + "40" : "none"};

  svg {
    font-size: 19px;
    opacity: ${({ $active }) => $active ? 1 : 0.7};
  }

  &:hover {
    background: ${({ $active, theme }) => $active ? (theme.gradientPrimary || "linear-gradient(135deg, #7C4DFF, #9C6FFF)") : theme.itemHover};
    color: ${({ $active, theme }) => $active ? "white" : theme.text};
    
    svg {
      opacity: 1;
    }
  }
`;

const NavItemButton = styled.div`
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  color: ${({ theme }) => theme.itemText};
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  margin-bottom: 2px;

  svg {
    font-size: 19px;
    opacity: 0.7;
  }

  &:hover {
    background: ${({ theme }) => theme.itemHover};
    color: ${({ theme }) => theme.text};
    
    svg {
      opacity: 1;
    }
  }
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.border};
  margin: 8px 4px;
`;

const TeamItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.itemText};
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  margin-bottom: 2px;

  &:hover {
    background: ${({ theme }) => theme.itemHover};
    color: ${({ theme }) => theme.text};
  }
`;

const TeamColorDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ color }) => color || "#7C4DFF"};
  flex-shrink: 0;
  box-shadow: 0 0 6px ${({ color }) => color || "#7C4DFF"}80;
`;

const AddTeamButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  color: ${({ theme }) => theme.primary};
  font-size: 13px;
  font-weight: 600;
  border: 1px dashed ${({ theme }) => theme.primary + "50"};
  background: ${({ theme }) => theme.primary + "08"};
  width: 100%;
  transition: all 0.2s ease;
  margin-top: 6px;
  font-family: inherit;

  &:hover {
    background: ${({ theme }) => theme.primary + "15"};
    border-color: ${({ theme }) => theme.primary + "80"};
  }
`;

const BottomSection = styled.div`
  padding: 12px;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const BottomItem = styled.button`
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 9px 12px;
  border-radius: 10px;
  cursor: pointer;
  color: ${({ theme }) => theme.textSoft};
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  font-family: inherit;

  svg {
    font-size: 18px;
  }

  &:hover {
    background: ${({ theme }) => theme.itemHover};
    color: ${({ danger, theme }) => danger ? theme.red || "#FF5252" : theme.text};
  }
`;

const TeamAvatarSmall = styled(Avatar)`
  width: 22px !important;
  height: 22px !important;
  font-size: 11px !important;
`;

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonLine = styled.div`
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.soft} 25%,
    ${({ theme }) => theme.bgCard || theme.bgLighter} 50%,
    ${({ theme }) => theme.soft} 75%
  );
  background-size: 400px 100%;
  animation: ${shimmer} 1.5s infinite;
  margin-bottom: 4px;
`;

// ─── Component ────────────────────────────────────────────────────────────────

const Menu = ({ darkMode, setDarkMode, setMenuOpen, setNewTeam }) => {
  const [teamsLoading, setTeamsLoading] = useState(true);
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [team, setTeams] = useState([]);
  const { currentUser } = useSelector(state => state.user);

  const logoutUser = () => {
    dispatch(logout());
    navigate(`/`);
  };

  const getteams = async () => {
    setTeamsLoading(true);
    await getUsers(token)
      .then((res) => {
        setTeams(res.data.teams || []);
        setTeamsLoading(false);
      })
      .catch((err) => {
        dispatch(openSnackbar({ message: err.response?.data?.message || err.message, type: "error" }));
        if (err.response?.status === 401 || err.response?.status === 402) logoutUser();
      });
  };

  useEffect(() => {
    getteams();
  }, [currentUser]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith('/' + path);
  };

  return (
    <Container setMenuOpen={setMenuOpen}>
      {/* Logo */}
      <LogoSection>
        <LogoWrap to="/">
          <LogoIconWrap>
            <LogoImg src={LogoIcon} alt="DevSync" />
          </LogoIconWrap>
          <LogoText>DevSync</LogoText>
        </LogoWrap>
        <CloseBtn onClick={() => setMenuOpen(false)}>
          <CloseRounded style={{ fontSize: 20 }} />
        </CloseBtn>
      </LogoSection>

      {/* Nav */}
      <NavSection>
        <NavLabel>Navigation</NavLabel>

        <NavItem to="/" $active={isActive('/')}>
          <DashboardRounded />
          Dashboard
        </NavItem>
        <NavItem to="/projects" $active={isActive('projects')}>
          <AccountTreeRounded />
          Projects
        </NavItem>
        <NavItem to="/works" $active={isActive('works')}>
          <AddTaskRounded />
          Your Works
        </NavItem>
        <NavItem to="/community" $active={isActive('community')}>
          <Public />
          Community
        </NavItem>

        <Divider />

        <NavLabel>
          <Groups2Rounded style={{ fontSize: 14 }} />
          Teams
        </NavLabel>

        {teamsLoading ? (
          <>
            <SkeletonLine />
            <SkeletonLine />
          </>
        ) : (
          <>
            {team.map((t, i) => (
              <TeamItem key={t._id} to={`/teams/${t._id}`}>
                {t.img ? (
                  <TeamAvatarSmall src={t.img}>{t.name?.[0]}</TeamAvatarSmall>
                ) : (
                  <TeamColorDot color={tagColors[i % tagColors.length]} />
                )}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.name}
                </span>
              </TeamItem>
            ))}
            <AddTeamButton onClick={() => setNewTeam(true)}>
              <Add style={{ fontSize: 16 }} />
              New Team
            </AddTeamButton>
          </>
        )}
      </NavSection>

      {/* Bottom Actions */}
      <BottomSection>
        <BottomItem onClick={() => setDarkMode(!darkMode)}>
          <SettingsBrightnessOutlined style={{ fontSize: 18 }} />
          {darkMode ? "Light Mode" : "Dark Mode"}
        </BottomItem>
        <BottomItem onClick={logoutUser} danger>
          <Logout style={{ fontSize: 18 }} />
          Logout
        </BottomItem>
      </BottomSection>
    </Container>
  );
};

export default Menu;
