import { IconButton, Modal, Snackbar } from "@mui/material";
import React, { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import styled from "styled-components";
import {
  Block,
  CloseRounded,
  EmailRounded,
  Visibility,
  VisibilityOff,
  PasswordRounded,
  TroubleshootRounded,
  SendRounded,
  SearchOutlined,
  RocketLaunch,
  AutoFixHigh
} from "@mui/icons-material";
import { tools } from "../data/data";
import { Avatar } from "@mui/material";
import { useSelector } from "react-redux";
import {
  inviteTeamMembers,
  inviteProjectMembers,
  searchUsers,
  createProject,
  addTeamProject,
  getUsers,
  warpDriveProject
} from "../api/index";
import { openSnackbar } from "../redux/snackbarSlice";
import { useDispatch } from "react-redux";
import { updateUser } from "../redux/userSlice";

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: #000000a7;
  display: flex;
  justify-content: center;
  overflow-y: auto;
`;

const Wrapper = styled.div`
  width: 100%;
  height: min-content;
  max-height: 90vh;
  overflow-y: auto;
  margin: 2% auto;
  max-width: 600px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.bgLighter};
  color: ${({ theme }) => theme.text};
  padding: 10px 10px 20px 10px;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Title = styled.div`
  font-size: 22px;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  margin: 12px 20px;
`;

const Desc = styled.textarea`
  width: 100%;
  border: none;
  font-size: 14px;
  border-radius: 3px;
  background-color: transparent;
  outline: none;
  padding: 0;
  margin: 0;
  color: ${({ theme }) => theme.text};
  resize: none;
  font-family: inherit;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
`;

const Label = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.textSoft};
  margin: 12px 20px 0px 20px;
`;

const OutlinedBox = styled.div`
  min-height: 48px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.soft2};
  color: ${({ theme }) => theme.soft2};
  overflow: hidden;
  ${({ googleButton, theme }) =>
    googleButton &&
    `
    user-select: none; 
  gap: 16px;`}
  ${({ button, theme }) =>
    button &&
    `
    user-select: none; 
  border: none;
    font-weight: 600;
    font-size: 16px;
    background: ${theme.soft};
    color:'${theme.soft2}';`}
    ${({ activeButton, theme }) =>
    activeButton &&
    `
    user-select: none; 
  border: none;
    background: ${theme.primary};
    color: white;`}
  margin: 3px 20px;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px 14px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 0px;
  margin: 12px 20px;
  align-items: center;
  justify-content: space-between;
`;

const TextInput = styled.input`
  width: 100%;
  border: none;
  font-size: 14px;
  border-radius: 3px;
  background-color: transparent;
  outline: none;
  color: ${({ theme }) => theme.text};
  font-family: inherit;
`;

const ToolsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 12px 18px;
`;

const Icon = styled.img`
  width: 16px;
  margin: 0px 6px 0px 0px;
`;

const AddMember = styled.div`
  margin: 22px;
  padding: 12px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.bgDark + "98"};
`;

const Search = styled.div`
  margin: 6px 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 12px;
  color: ${({ theme }) => theme.textSoft};
  background-color: ${({ theme }) => theme.bgDark};
`;

const Input = styled.input`
  width: 100%;
  border: none;
  font-size: 14px;
  padding: 10px 20px;
  border-radius: 100px;
  background-color: transparent;
  outline: none;
  color: ${({ theme }) => theme.textSoft};
`;

const UsersList = styled.div`
  padding: 18px 8px;
  display: flex;
  margin-bottom: 12px;
  flex-direction: column;
  gap: 12px;
  border-radius: 12px;
  color: ${({ theme }) => theme.textSoft};
`;

const MemberCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
`;
const UserData = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Details = styled.div`
  gap: 4px;
`;

const Name = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.textSoft};
`;

const EmailId = styled.div`
  font-size: 10px;
  font-weight: 400;
  color: ${({ theme }) => theme.textSoft + "99"};
`;

const Flex = styled.div`
display: flex;
flex-direction: row;
gap: 2px;
@media (max-width: 768px) {
  display: flex;
  flex-direction: column;
  align-items: center;
}
`;

const Access = styled.div`
padding: 6px 10px;
border-radius: 12px;
display: flex;
align-items: center;
justify-content: center;
font-size: 12px;
background-color: ${({ theme }) => theme.bgDark};
`;

const Select = styled.select`
  border: none;
  font-size: 12px;
  background-color: transparent;
  outline: none;
  color: ${({ theme }) => theme.text};
  background-color: ${({ theme }) => theme.bgDark};
`;

const Role = styled.div`
  background-color: ${({ theme }) => theme.bgDark};
  border-radius: 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;


const InviteButton = styled.button`
  padding: 6px 14px;
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.primary};
  border-radius: 1px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  border-radius: 10px;
  transition: all 0.3s ease;
  ${({ disabled, theme }) =>
    disabled &&
    `
    opacity: 0.5;
    cursor: not-allowed;
    border-color: ${theme.textSoft};
    color: ${theme.textSoft};
  `}
  &:hover {
    background-color: ${({ disabled, theme }) => (disabled ? "transparent" : theme.primary)};
    color: ${({ disabled, theme }) => (disabled ? theme.textSoft : theme.text)};
  }
`;

const ProjectName = styled.div`
  font-size: 14px;
`;

const WarpContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 10px 20px;
`;

const WarpPromptArea = styled.textarea`
  width: 100%;
  min-height: 150px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid ${({ theme }) => theme.soft + "50"};
  border-radius: 12px;
  padding: 16px;
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  resize: none;
  outline: none;
  font-family: inherit;
  &:focus {
    border-color: ${({ theme }) => theme.primary};
  }
`;

const MatrixOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000;
  z-index: 1000;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const MatrixText = styled.div`
  font-family: 'Courier New', Courier, monospace;
  color: #00ff41;
  font-size: 14px;
  text-shadow: 0 0 5px #00ff41;
  margin-top: 5px;
  text-align: center;
`;

const GlowButton = styled.div`
  padding: 14px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
  font-weight: 700;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  &:hover {
    box-shadow: 0 0 30px rgba(168, 85, 247, 0.6);
    transform: scale(1.02);
  }
`;

const ModeToggle = styled.div`
  display: flex;
  background: ${({ theme }) => theme.bg};
  padding: 4px;
  border-radius: 10px;
  margin: 0 20px 10px;
`;

const ModeButton = styled.div`
  flex: 1;
  padding: 8px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  color: ${({ active, theme }) => (active ? theme.text : theme.textSoft)};
  background: ${({ active, theme }) => (active ? theme.soft : 'transparent')};
`;

const AddNewProject = ({ setNewProject, teamId, teamProject }) => {
  const [Loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [backDisabled, setBackDisabled] = useState(false);

  const [showAddProject, setShowAddProject] = useState(true);
  const [showTools, setShowTools] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [isWarpDrive, setIsWarpDrive] = useState(false);
  const [warpPrompt, setWarpPrompt] = useState("");
  const [isWarping, setIsWarping] = useState(false);
  const [warpStatus, setWarpStatus] = useState("Initiating Warp Sequence...");

  const warpSteps = [
    "Contacting AI Architect...",
    "Analyzing Project Requirements...",
    "Generating Professional Description...",
    "Identifying Technology Stack...",
    "Finalizing Language Tags...",
    "Stabilizing Wormhole..."
  ];

  const goToAddProject = () => {
    setShowAddProject(true);
    setShowTools(false);
    setShowAddMember(false);
  };

  const goToAddTools = () => {
    setShowAddProject(false);
    setShowAddMember(false);
    setShowTools(true);
  };

  const goToAddMember = () => {
    setShowAddProject(false);
    setShowTools(false);
    setShowAddMember(true);
  };

  //add member part

  const [search, setSearch] = React.useState("");
  const [users, setUsers] = React.useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const [role, setRole] = useState("");
  const [access, setAccess] = useState("");
  const [selectedUsers, setSelectedUsers] = React.useState([]);
  const [inputs, setInputs] = useState({ img: "", title: "", desc: "", githubRepo: "" });

  const token = localStorage.getItem("token");
  const handleSearch = async (e) => {
    setSearch(e.target.value);
    searchUsers(e.target.value, token)
      .then((res) => {
        if (res.status === 200) {
          setUsers(res.data);
        }
        else {
          setUsers([]);
        }
      })
      .catch((err) => {
        setUsers([]);
      });
  };

  const handleSelect = (user) => {
    const User = {
      id: user._id,
      name: user.name,
      email: user.email,
    };
    if (selectedUsers.find((u) => u.id === User.id)) {
    } else {
      setSelectedUsers([...selectedUsers, {
        id: user._id,
        name: user.name,
        email: user.email,
        role: role,
        access: access,
      }]);
      setUsers([]);
      setAccess("");
      setRole("");
      setSearch("");
    }
  };

  //remove members from selected users
  const handleRemove = (user) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
  };

  const handleInviteAll = (id) => {
    selectedUsers.map((user) => {
      inviteProjectMembers(id, user, token)
        .then((res) => {
          console.log(res);
          dispatch(
            openSnackbar({
              message: `Invitation sent to ${user.name}`,
              type: "success",
            })
          );
        })
        .catch((err) => {
          console.log(err);
          dispatch(
            openSnackbar({
              message: `Invitation cant be sent to ${user.name}`,
              type: "error",
            })
          );
        });
    });
  };

  const handleChange = (e) => {
    setInputs((prev) => {
      if (e.target.name === "tags") {
        return { ...prev, [e.target.name]: e.target.value.split(",") };
      } else {
        return { ...prev, [e.target.name]: e.target.value };
      }
    });
  };

  const [projectTools, setProjectTools] = useState([
    { name: "", icon: "", link: "" },
    { name: "", icon: "", link: "" },
    { name: "", icon: "", link: "" },
    { name: "", icon: "", link: "" },
    { name: "", icon: "", link: "" },
  ]);
  const handleToolschange = (index, event, icon) => {
    let data = [...projectTools];
    data[index].name = event.target.name;
    data[index].icon = icon;
    data[index].link = event.target.value;
    setProjectTools(data);
  };

  const CreateProject = () => {
    setLoading(true);
    setDisabled(true);
    setBackDisabled(true);
    const tools = projectTools.filter((tool) => tool.link !== "");
    const tags = inputs.tags ? inputs.tags.filter(tag => tag && tag.trim() !== "") : [];
    const project = {
      ...inputs,
      tags: tags,
      tools: tools,
    };
    if (teamProject) {
      addTeamProject(teamId, project, token)
        .then(async (res) => {
          handleInviteAll(res.data._id);
          await getUsers(token).then((res) => {
            dispatch(updateUser(res.data));
          });
          setLoading(false);
          setNewProject(false);
          dispatch(openSnackbar({ message: "Project created successfully", severity: "success" }));
        })
        .catch((err) => {
          setLoading(false);
          setDisabled(false);
          setBackDisabled(false);
          dispatch(openSnackbar({ message: err.response?.data?.message || err.message || "Something went wrong", severity: "error" }));
        });
    } else {
      createProject(project, token)
        .then(async (res) => {
          handleInviteAll(res.data._id);
          await getUsers(token).then((res) => {
            dispatch(updateUser(res.data));
          });
          setLoading(false);
          setNewProject(false);
          dispatch(openSnackbar({ message: "Project created successfully", severity: "success" }));
        })
        .catch((err) => {
          setLoading(false);
          setDisabled(false);
          setBackDisabled(false);
          dispatch(openSnackbar({ message: err.response?.data?.message || err.message || "Something went wrong", severity: "error" }));
        });
    }
  };

  const handleWarpDrive = async () => {
    if (!warpPrompt) {
      dispatch(openSnackbar({ message: "Please enter a prompt for the AI.", severity: "warning" }));
      return;
    }

    setIsWarping(true);
    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < warpSteps.length) {
        setWarpStatus(warpSteps[stepIndex]);
        stepIndex++;
      }
    }, 1200);

    try {
      const token = localStorage.getItem("token");
      const res = await warpDriveProject({ prompt: warpPrompt }, token);
      clearInterval(interval);
      setWarpStatus("Warp Sequence Complete! Redirecting...");

      setTimeout(() => {
        setNewProject(false);
        window.location.replace(`/projects/${res.data.projectId}`);
      }, 1500);

    } catch (err) {
      clearInterval(interval);
      setIsWarping(false);
      dispatch(
        openSnackbar({
          message: err.response?.data?.message || err.message || "Warp sequence failed. Please check your API key.",
          severity: "error",
        })
      );
    }
  };

  useEffect(() => {
    if (inputs.title === "" || inputs.desc === "") {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [inputs]);

  const dispatch = useDispatch();

  return (
    <Modal open={true} onClose={() => setNewProject(false)}>
      <Container>
        <Wrapper>
          <IconButton
            style={{
              position: "absolute",
              top: "18px",
              right: "30px",
              cursor: "pointer",
              color: "inherit",
            }}
            onClick={() => setNewProject(false)}
          >
            <CloseRounded style={{ color: "inherit" }} />
          </IconButton>
          <Title>Create a new project</Title>

          {isWarping && (
            <MatrixOverlay>
              <RocketLaunch style={{ fontSize: 48, color: '#00ff41', marginBottom: '20px' }} />
              <div style={{ color: '#00ff41', fontWeight: 'bold', fontSize: '18px', letterSpacing: '2px' }}>AI WARP DRIVE ACTIVE</div>
              <div style={{ height: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <MatrixText>{warpStatus}</MatrixText>
                <MatrixText style={{ opacity: 0.5 }}>{" > "}{Math.random().toString(36).substring(2, 15)}</MatrixText>
                <MatrixText style={{ opacity: 0.3 }}>{" > "}SYNC_SEQ_{Math.floor(Math.random() * 10000)}</MatrixText>
              </div>
            </MatrixOverlay>
          )}

          {!showTools && !showAddMember && (
            <ModeToggle>
              <ModeButton active={!isWarpDrive} onClick={() => setIsWarpDrive(false)}>Manual Setup</ModeButton>
              <ModeButton active={isWarpDrive} onClick={() => setIsWarpDrive(true)}>
                <AutoFixHigh fontSize="inherit" style={{ marginRight: '6px' }} />
                AI Warp Drive
              </ModeButton>
            </ModeToggle>
          )}

          {showAddProject && (
            <>
              {isWarpDrive ? (
                <WarpContainer>
                  <div style={{ fontSize: '14px', color: '#888', fontStyle: 'italic' }}>
                    Describe your project idea and our AI will generate a professional <strong style={{ color: '#a855f7' }}>description</strong> and <strong style={{ color: '#a855f7' }}>technology tags</strong> for you instantly.
                  </div>
                  <WarpPromptArea
                    placeholder="Describe your vision here..."
                    value={warpPrompt}
                    onChange={(e) => setWarpPrompt(e.target.value)}
                  />
                  <GlowButton onClick={handleWarpDrive}>
                    <RocketLaunch />
                    Engage Warp Drive
                  </GlowButton>
                  <div style={{ height: '20px' }} />
                </WarpContainer>
              ) : (
                <>
                  <Label>Project Details :</Label>
                  <OutlinedBox style={{ marginTop: "12px" }}>
                    <TextInput
                      placeholder="Title (Required)*"
                      type="text"
                      name="title"
                      value={inputs.title}
                      onChange={handleChange}
                    />
                  </OutlinedBox>
                  <OutlinedBox style={{ marginTop: "6px", alignItems: "flex-start", padding: "12px 14px" }}>
                    <Desc
                      placeholder="Description (Required)* "
                      name="desc"
                      rows={5}
                      value={inputs.desc}
                      onChange={handleChange}
                    />
                  </OutlinedBox>
                  <OutlinedBox style={{ marginTop: "6px", alignItems: "flex-start", padding: "12px 14px", overflow: "hidden" }}>
                    <Desc
                      placeholder="Tags: seperate by , eg- Mongo Db , React JS .."
                      name="tags"
                      rows={4}
                      value={inputs.tags}
                      onChange={handleChange}
                    />
                  </OutlinedBox>

                  <OutlinedBox style={{ marginTop: "6px" }}>
                    <TextInput
                      placeholder="GitHub Repository URL (Optional) e.g. facebook/react"
                      type="text"
                      name="githubRepo"
                      value={inputs.githubRepo}
                      onChange={handleChange}
                    />
                  </OutlinedBox>

                  <OutlinedBox
                    button={true}
                    activeButton={!disabled}
                    style={{ marginTop: "22px", marginBottom: "18px" }}
                    onClick={() => {
                      !disabled && goToAddTools();
                    }}
                  >
                    Next
                  </OutlinedBox>
                </>
              )}
            </>
          )}

          {showTools && (
            <>
              <Label>Tools :</Label>
              <ToolsContainer>
                {tools.map((tool, index) => (
                  <OutlinedBox style={{ marginTop: "8px" }} key={index}>
                    <Icon src={tool.icon} />
                    <TextInput
                      name={tool.name}
                      placeholder={`${tool.name} Link`}
                      type="text"
                      value={projectTools[index].link}
                      onChange={(event) =>
                        handleToolschange(index, event, tool.icon)
                      }
                    />
                  </OutlinedBox>
                ))}
              </ToolsContainer>

              <ButtonContainer>
                <OutlinedBox
                  button={true}
                  activeButton={false}
                  style={{ marginTop: "18px", width: "100%" }}
                  onClick={() => {
                    !backDisabled && goToAddProject();
                  }}
                >
                  Back
                </OutlinedBox>
                <OutlinedBox
                  button={true}
                  activeButton={!disabled}
                  style={{ marginTop: "18px", width: "100%" }}
                  onClick={() => {
                    goToAddMember();
                  }}
                >
                  Next
                </OutlinedBox>
              </ButtonContainer>
            </>
          )}

          {showAddMember && (
            <>
              <Label>Add Members :</Label>

              <AddMember>
                <Search>
                  <Input
                    placeholder="Search by email..."
                    value={search}
                    onChange={(e) => handleSearch(e)}
                  />
                  <SearchOutlined
                    sx={{ fontSize: "20px" }}
                    style={{ marginRight: "12px", marginLeft: "12px" }}
                  />
                </Search>
                <UsersList>
                  {users.map((user, index) => (
                    <MemberCard key={index}>
                      <UserData>
                        <Avatar
                          sx={{ width: "34px", height: "34px" }}
                          src={user.img}
                        >
                          {user.name.charAt(0)}
                        </Avatar>
                        <Details>
                          <Name>{user.name}</Name>
                          <EmailId>{user.email}</EmailId>
                        </Details>
                      </UserData>
                      <Flex>
                        <Access>
                          <Select name="Role" onChange={(e) => setAccess(e.target.value)}>
                            <option value="" selected disabled hidden>Access</option>
                            <option value="Admin">Admin</option>
                            <option value="Member">Member</option>
                            <option value="Editor">Editor</option>
                            <option value="View Only">View Only</option>
                          </Select>
                        </Access>
                        <Role>
                          <Input style={{ width: '70px', fontSize: '12px', padding: '8px 10px' }} type="text" placeholder="Role" onChange={(e) => setRole(e.target.value)} />
                        </Role>

                      </Flex>
                      <InviteButton
                        disabled={access === "" || role === ""}
                        onClick={() => {
                          if (access !== "" && role !== "") {
                            handleSelect(user);
                          }
                        }}
                      >
                        Add
                      </InviteButton>
                    </MemberCard>
                  ))}
                  {selectedUsers.length === 0 && users.length === 0 && search.length === 0 && (
                    <div style={{ width: "100%", textAlign: "center" }}>
                      Search to add new members
                    </div>
                  )}
                  {selectedUsers.length > 0 && <div>Added Members :</div>}
                  {selectedUsers.map((user, index) => (
                    <MemberCard key={index}>
                      <UserData>
                        <Avatar
                          sx={{ width: "34px", height: "34px" }}
                          src={user.img}
                        >
                          {user.name.charAt(0)}
                        </Avatar>
                        <Details>
                          <Name>{user.name}</Name>
                          <EmailId>{user.email}</EmailId>
                        </Details>
                      </UserData>
                      <Flex>
                        <Access>
                          {user.access}
                        </Access>
                        <Role style={{ padding: '6px 10px' }}>
                          {user.role}
                        </Role>

                      </Flex>
                      <InviteButton onClick={() => handleRemove(user)}>
                        Remove
                      </InviteButton>
                    </MemberCard>
                  ))}
                </UsersList>
              </AddMember>

              <ButtonContainer>
                <OutlinedBox
                  button={true}
                  activeButton={false}
                  style={{ marginTop: "18px", width: "100%" }}
                  onClick={() => {
                    !backDisabled && goToAddTools();
                  }}
                >
                  Back
                </OutlinedBox>
                <OutlinedBox
                  button={true}
                  activeButton={!disabled}
                  style={{ marginTop: "18px", width: "100%" }}
                  onClick={() => {
                    !disabled && CreateProject();
                  }}
                >
                  {Loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : (
                    "Create Project"
                  )}
                </OutlinedBox>
              </ButtonContainer>
            </>
          )}
        </Wrapper>
      </Container>
    </Modal>
  );
};

export default AddNewProject;
