import { ThemeProvider } from "styled-components";
import { useState } from "react";
import { darkTheme, lightTheme } from "./utils/Theme";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom"
import Menu from './components/Menu';
import Navbar from './components/Navbar';
import styled from 'styled-components';
import DashboardNew from './pages/DashboardNew';
import ProjectsNew from './pages/ProjectsNew';
import StitchDashboard from './pages/StitchDashboard';
import KanbanDashboard from './pages/KanbanDashboard';
import MessagesDashboard from './pages/MessagesDashboard';
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ProjectDetails from './pages/ProjectDetails';
import Teams from './pages/Teams';
import ToastMessage from './components/ToastMessage';
import CommunityNew from './pages/CommunityNew';
import WorksNew from './pages/WorksNew';
import Chats from './pages/Chats';
import ProjectInvite from './components/ProjectInvite';
import TeamInvite from './components/TeamInvite';
import AddNewProject from './components/AddNewProject';
import { useSelector, useDispatch } from "react-redux";
import AddNewTeam from './components/AddNewTeam';
import { useEffect } from 'react';
import { getUsers } from './api';
import Home from './pages/Home/Home';
import LiveNotifications from './components/LiveNotifications';
import { io } from 'socket.io-client';

const Container = styled.div`
  height: 100vh;
  display: flex; 
  background-color: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};
  overflow-x: hidden;
`;

const Main = styled.div`
  flex: 7;
`;
const Wrapper = styled.div`
  padding: 0% 1%;
  overflow-y: scroll !important;
`;

function AppContent({ darkMode, setDarkMode }) {
  const [menuOpen, setMenuOpen] = useState(true);
  const [newTeam, setNewTeam] = useState(false);
  const [newProject, setNewProject] = useState(false);
  const { open, message, severity } = useSelector((state) => state.snackbar);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useSelector(state => state.user);
  const [globalSocket, setGlobalSocket] = useState(null);

  // Global socket for live notifications
  useEffect(() => {
    if (!currentUser) return;
    const socket = io('http://localhost:8700', { transports: ['websocket'] });
    socket.emit('add-user', currentUser._id);
    setGlobalSocket(socket);
    return () => socket.disconnect();
  }, [currentUser]);

  useEffect(() => {
    const resize = () => {
      if (window.innerWidth < 1110) {
        setMenuOpen(false);
      } else {
        setMenuOpen(true);
      }
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return currentUser ? (
    <Container>
      {loading ? <div>Loading...</div> : <>
        {menuOpen && <Menu setMenuOpen={setMenuOpen} setDarkMode={setDarkMode} darkMode={darkMode} setNewTeam={setNewTeam} />}
        <Main>
          <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
          <Wrapper>
            {newTeam && <AddNewTeam setNewTeam={setNewTeam} />}
            {newProject && <AddNewProject setNewProject={setNewProject} />}
            <Routes>
              <Route exact path="/" element={<DashboardNew setNewTeam={setNewTeam} setNewProject={setNewProject} />} />
              <Route path="projects/:id" element={<ProjectDetails />} />
              <Route path="projects" element={<ProjectsNew setNewProject={setNewProject} />} />
              <Route path="projects/invite/:code" element={<ProjectInvite />} />
              <Route path="teams/:id" element={<Teams />} />
              <Route path="team/invite/:code" element={<TeamInvite />} />
              <Route path="works" element={<WorksNew />} />
              <Route path="community" element={<CommunityNew />} />
              <Route path="chats" element={<Chats />} />
              <Route path="*" element={<div>Not Found</div>} />
            </Routes>
          </Wrapper>
        </Main>
      </>}
      {open && <ToastMessage open={open} message={message} severity={severity} />}
      <LiveNotifications socket={globalSocket} />
    </Container>
  ) : (
    <ThemeProvider theme={darkTheme}>
      <Routes>
        <Route exact path="/">
          <Route index element={<Home />} />
          <Route path="team/invite/:code" element={<TeamInvite />} />
          <Route path="projects/invite/:code" element={<ProjectInvite />} />
        </Route>
      </Routes>
      {open && <ToastMessage open={open} message={message} severity={severity} />}
    </ThemeProvider>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <DndProvider backend={HTML5Backend}>
      <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
        <BrowserRouter>
          <Routes>
            <Route path="/stitch" element={<StitchDashboard />} />
            <Route path="/timeline" element={<KanbanDashboard />} />
            <Route path="/messages" element={<MessagesDashboard />} />
            <Route path="/*" element={<AppContent darkMode={darkMode} setDarkMode={setDarkMode} />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </DndProvider>
  );
}

export default App;
