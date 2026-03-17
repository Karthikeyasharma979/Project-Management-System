import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import SearchIcon from "@mui/icons-material/Search";
import { useSelector } from "react-redux";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import MenuIcon from "@mui/icons-material/Menu";
import { IconButton } from "@mui/material";
import { Forum, NotificationsRounded } from "@mui/icons-material";
import Badge from "@mui/material/Badge";
import { useDispatch } from "react-redux";
import Avatar from "@mui/material/Avatar";
import AccountDialog from "./AccountDialog";
import UserAvatar from "./UserAvatar";
import NotificationDialog from "./NotificationDialog";
import { getUsers, notifications, clearNotifications } from "../api/index";
import { openSnackbar } from "../redux/snackbarSlice";
import { logout } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";

// ─── Styles ───────────────────────────────────────────────────────────────────

const Container = styled.div`
  position: sticky;
  top: 0;
  height: 60px;
  z-index: 99;
  background: ${({ theme }) => theme.bgLighter};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  backdrop-filter: blur(12px);

  @media screen and (max-width: 480px) {
    padding: 0 8px;
  }
`;

const MenuBtn = styled(IconButton)`
  color: ${({ theme }) => theme.textSoft} !important;
  width: 36px !important;
  height: 36px !important;
  border-radius: 10px !important;

  &:hover {
    background: ${({ theme }) => theme.itemHover} !important;
    color: ${({ theme }) => theme.text} !important;
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  max-width: 460px;
  margin: 0 auto;
  position: relative;
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${({ theme }) => theme.bg};
  border: 1.5px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 0 14px;
  height: 38px;
  transition: all 0.25s ease;

  &:focus-within {
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.primary + "20"};
    background: ${({ theme }) => theme.bgLighter};
  }

  input {
    flex: 1;
    border: none;
    background: transparent;
    color: ${({ theme }) => theme.text};
    font-size: 14px;
    font-family: inherit;
    outline: none;

    &::placeholder {
      color: ${({ theme }) => theme.textMuted || theme.textSoft};
      font-size: 13px;
    }
  }

  svg {
    color: ${({ theme }) => theme.textMuted || theme.textSoft};
    font-size: 18px;
  }
`;

const UserActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
`;

const IconBtn = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ theme }) => theme.textSoft};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.itemHover};
    color: ${({ theme }) => theme.text};
  }

  .MuiSvgIcon-root {
    font-size: 20px;
  }
`;

const AvatarWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 10px 4px 4px;
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1.5px solid transparent;

  &:hover {
    background: ${({ theme }) => theme.itemHover};
    border-color: ${({ theme }) => theme.border};
  }
`;

const UserName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};

  @media (max-width: 768px) {
    display: none;
  }
`;

const OnlineDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00E5A0;
  border: 2px solid ${({ theme }) => theme.bgLighter};
  position: absolute;
  bottom: 1px;
  right: 1px;
`;

const AvatarWrapper = styled.div`
  position: relative;
`;

const SignInButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border-radius: 12px;
  background: ${({ theme }) => theme.gradientPrimary || "linear-gradient(135deg, #7C4DFF, #9C6FFF)"};
  color: white;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  transition: all 0.25s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px ${({ theme }) => theme.primary + "50"};
  }
`;

const StyledBadge = styled(Badge)`
  .MuiBadge-badge {
    background: ${({ theme }) => theme.primary} !important;
    color: white !important;
    font-size: 10px !important;
    min-width: 16px !important;
    height: 16px !important;
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

const Navbar = ({ menuOpen, setMenuOpen }) => {
  const [SignUpOpen, setSignUpOpen] = useState(false);
  const [SignInOpen, setSignInOpen] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState(false);
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [notification, setNotification] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    getUsers(token).then((res) => {
      setUsers(res.data);
    }).catch((err) => {
      if (err.response?.status === 401) {
        dispatch(logout());
      }
    });
  }, [dispatch]);

  const getNotifications = async () => {
    try {
      notifications(token).then((res) => {
        setNotification(res.data);
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getNotifications();
  }, []);

  const handleClearNotifications = async () => {
    try {
      await clearNotifications(token);
      setNotification([]);
      dispatch(openSnackbar({ message: "Notifications cleared", severity: "success" }));
    } catch (error) {
      dispatch(openSnackbar({ message: "Failed to clear notifications", severity: "error" }));
    }
  };

  useEffect(() => {
    if (!currentUser && !SignUpOpen) {
      setSignInOpen(true);
      setSignUpOpen(false);
    } else if (!currentUser && SignUpOpen) {
      setSignInOpen(false);
      setSignUpOpen(true);
    }
    if (currentUser && !currentUser.verified) {
      setVerifyEmail(true);
    } else {
      setVerifyEmail(false);
    }
  }, [currentUser, SignInOpen, SignUpOpen, setVerifyEmail, users]);

  // Account dialog
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // Notification dialog
  const [anchorEl2, setAnchorEl2] = useState(null);
  const open2 = Boolean(anchorEl2);
  const id2 = open2 ? "simple-popover" : undefined;
  const notificationClick = (event) => setAnchorEl2(event.currentTarget);
  const notificationClose = () => setAnchorEl2(null);

  return (
    <>
      <Container>
        <MenuBtn onClick={() => setMenuOpen(!menuOpen)} size="small">
          <MenuIcon style={{ fontSize: 20 }} />
        </MenuBtn>

        <SearchContainer>
          <SearchInput>
            <SearchIcon />
            <input
              placeholder="Search projects, tasks, people..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </SearchInput>
        </SearchContainer>

        <UserActions>
          {currentUser ? (
            <>
              <IconBtn onClick={() => navigate('/chats')}>
                <Forum style={{ fontSize: 20 }} />
              </IconBtn>

              <IconBtn onClick={notificationClick}>
                <StyledBadge badgeContent={notification.length} max={99}>
                  <NotificationsRounded style={{ fontSize: 20 }} />
                </StyledBadge>
              </IconBtn>

              <AvatarWrap onClick={handleClick}>
                <AvatarWrapper>
                  <UserAvatar
                    user={currentUser}
                    sx={{ width: 32, height: 32 }}
                  />
                  <OnlineDot />
                </AvatarWrapper>
                <UserName>{currentUser.name?.split(' ')[0]}</UserName>
              </AvatarWrap>
            </>
          ) : (
            <SignInButton onClick={() => setSignInOpen(true)}>
              <AccountCircleOutlinedIcon style={{ fontSize: 18 }} />
              Sign In
            </SignInButton>
          )}
        </UserActions>
      </Container>

      {currentUser && (
        <AccountDialog
          open={open}
          anchorEl={anchorEl}
          id={id}
          handleClose={handleClose}
          currentUser={currentUser}
        />
      )}
      {currentUser && (
        <NotificationDialog
          open={open2}
          anchorEl={anchorEl2}
          id={id2}
          handleClose={notificationClose}
          currentUser={currentUser}
          notification={notification}
          handleClearNotifications={handleClearNotifications}
        />
      )}
    </>
  );
};

export default Navbar;
