import React, { useEffect } from "react";
import { Fragment, useState, useRef } from "react";
import styled from "styled-components";
import { CloseRounded } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { Avatar } from "@mui/material";
import { Modal } from "@mui/material";
import { addWorks } from "../api";
import CircularProgress from "@mui/material/CircularProgress";
import { useDispatch } from "react-redux";
import { openSnackbar } from "../redux/snackbarSlice";
import AITaskAssistant from "./AITaskAssistant";

const Container = styled.div`
  padding: 12px 14px;
  text-align: left;
  margin: 2px 0px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.09);
  &:hover {
    transition: all 0.6s ease-in-out;
    box-shadow: 0 0 18px 0 rgba(0, 0, 0, 0.5);
  }
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.textSoft};
  flex: 7;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* number of lines to show */
  line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const Desc = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.soft2};
  margin-top: 4px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 5; /* number of lines to show */
  line-clamp: 5;
  -webkit-box-orient: vertical;
`;

const Task = styled.div`
  margin: 12px 0px;
`;

const Bottom = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 2px 0px;
`;

const Members = styled.div`
  display: flex;
  flex: 1;
  justify-content: start;
  align-items: center;
  gap: 2px;
  flex-wrap: wrap;
`;
const MemberGroup = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.soft};
  padding: 4px 4px;
  gap: 1px;
  border-radius: 100px;
`;

const IcoButton = styled(IconButton)`
  color: ${({ theme }) => theme.textSoft} !important;
`;

const TextBtn = styled.div`
  flex: 0.6;
  font-size: 12px;
  font-weight: 500;
  color: #0094ea;
  &:hover {
    color: #0094ea99;
  }
`;

const TextInput = styled.input`
  width: 100%;
  border: none;
  font-size: 14px;
  border-radius: 3px;
  background-color: transparent;
  outline: none;
  color: ${({ theme }) => theme.textSoft};
`;

const TextArea = styled.textarea`
  width: 100%;
  border: none;
  font-size: 14px;
  border-radius: 3px;
  background-color: transparent;
  outline: none;
  font-family: "Poppins", sans-serif;
  padding: 8px 0px;
  color: ${({ theme }) => theme.textSoft};
`;
const OutlinedBox = styled.div`
  min-height: 34px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.soft2};
  color: ${({ theme }) => theme.soft2};
  ${({ button, theme }) =>
    button &&
    `
    user-select: none; 
    border: none;
  font-weight: 600;
  height: 38px;
    background: ${theme.soft};
    color:'${theme.soft2}';`}
  ${({ activeButton, theme }) =>
    activeButton &&
    `
    user-select: none; 
    border: none;
  height: 38px;
    background: ${theme.primary};
    color: white;`}
  margin: 6px 0px;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 500;
  padding: 0px 10px;
`;
const FlexDisplay = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: space-between;
`;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: #000000a7;
  display: flex;
  justify-content: center;
`;

const Body = styled.div`
  width: 100%;
  height: min-content;
  margin: 2%;
  max-width: 300px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.bgLighter};
  color: ${({ theme }) => theme.text};
  padding: 10px;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const UsersList = styled.div`
  padding: 18px 8px;
  display: flex;
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
  &:hover {
    background-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.text};
  }
`;

const AddWork = ({ ProjectMembers, ProjectId, setCreated, closeForm }) => {
  const dispatch = useDispatch();
  //hooks for different steps of the work card
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectMember, setSelectMember] = useState(false);
  //the work card hook
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState("");
  const [taskIndex, setTaskIndex] = useState(0);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const token = localStorage.getItem("token");

  //tasks
  const [task, setTask] = useState([
    {
      task: "",
      desc: "",
      start_date: "",
      end_date: "",
      members: [],
    },
  ]);
  const handleTaskChange = (index, event) => {
    let data = [...task];
    data[index][event.target.name] = event.target.value;
    setTask(data);
  };

  const goToAddTask = () => {
    // Deprecated: We skip step 1 now and just create directly via createWorkCard.
  };

  const addTasks = () => {
    let newfield = { task: "", desc: "", start_date: "", end_date: "", members: [] };
    setTask([...task, newfield]);
  };

  const deleteTasks = (index) => {
    let data = [...task];
    data.splice(index, 1);
    setTask(data);
  };

  //task member
  const addMember = (index) => {
    setSelectMember(true);
    setTaskIndex(index);
  };

  const removeMember = (index, memberIndex) => {
    let data = [...task];
    data[index].members.splice(memberIndex, 1);
    setTask(data);
  };

  const AddToMember = (member, index) => {
    //if member exist dont add

    if (task[index].members.find((item) => item.id === member.id._id)) return;

    let data = [...task];
    data[index].members.push({ id: member.id._id, img: member.id.img });

    setTask(data);
  };

  //create new work card
  const createWorkCard = () => {
    if (!title || !desc) {
      alert("Please fill the title and description fields");
      return;
    }

    // Auto-generate a single task based on the Work's title and description
    // This gives the user the illusion of just creating a "Task" directly on the board.
    let generatedTask = [{
      task: title,
      desc: desc,
      start_date: startDate || new Date().toISOString().split('T')[0],
      end_date: endDate || new Date().toISOString().split('T')[0],
      members: selectedMembers.map((m) => m.id)
    }];

    let newWorkCard = {
      title,
      desc,
      tags: tags ? tags.split(",") : [],
      tasks: generatedTask,
    };

    console.log(newWorkCard);
    setLoading(true);
    addWorks(ProjectId, newWorkCard, token)
      .then((res) => {
        setLoading(false);
        emptyForm();
        setCreated(true);
        if (closeForm) closeForm();
        dispatch(
          openSnackbar({
            message: "Created a work card Successfully",
            severity: "success",
          })
        );
      })
      .catch((err) => {
        console.log(err);
        dispatch(
          openSnackbar({
            message: err.response?.data?.message || err.message,
            severity: "error",
          })
        );
        setLoading(false);
      });
  };

  const emptyForm = () => {
    setTitle("");
    setDesc("");
    setTags("");
    setTask([
      {
        task: "",
        desc: "",
        start_date: "",
        end_date: "",
        members: [],
      },
    ]);
    setSelectedMembers([]);
    setStartDate("");
    setEndDate("");
    setStep(0);
  };

  return (
    <Container className={"item"}>
      {step === 0 && (
        <>
          <Top>
            <Title>Create Task</Title>
            <AITaskAssistant
              taskTitle={title}
              projectId={ProjectId}
              onApply={(result) => {
                if (result.description) setDesc(result.description);
                if (result.tags?.length > 0) setTags(result.tags.join(", "));
              }}
            />
          </Top>
          <OutlinedBox style={{ marginTop: "8px" }}>
            <TextInput
              placeholder="Title card"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </OutlinedBox>
          <OutlinedBox>
            <TextArea
              placeholder="What is this task about?"
              name="desc"
              rows={4}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </OutlinedBox>
          <FlexDisplay>
            <OutlinedBox style={{ width: "100%", flexDirection: "column", alignItems: "flex-start", padding: "8px 12px", gap: "4px" }}>
              <div style={{ fontSize: "11px", fontWeight: "600", color: "inherit" }}>Start Date</div>
              <TextInput
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ color: "inherit" }}
              />
            </OutlinedBox>
            <OutlinedBox style={{ width: "100%", flexDirection: "column", alignItems: "flex-start", padding: "8px 12px", gap: "4px" }}>
              <div style={{ fontSize: "11px", fontWeight: "600", color: "inherit" }}>End Date</div>
              <TextInput
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ color: "inherit" }}
              />
            </OutlinedBox>
          </FlexDisplay>


          {ProjectMembers && ProjectMembers.length > 0 && (
            <OutlinedBox style={{ flexDirection: "column", alignItems: "flex-start", padding: "12px", height: "auto", gap: "8px" }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "inherit" }}>Assign Members</div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {ProjectMembers.map((member) => {
                  if (!member || !member.id) return null;
                  const isSelected = selectedMembers.some((m) => m.id === member.id._id);
                  return (
                    <div
                      key={member.id._id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedMembers((prev) => prev.filter((m) => m.id !== member.id._id));
                        } else {
                          setSelectedMembers((prev) => [...prev, { id: member.id._id, img: member.id.img }]);
                        }
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        background: isSelected ? "rgba(0, 148, 234, 0.15)" : "transparent",
                        border: isSelected ? "1px solid #0094ea" : "1px solid #555",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <Avatar src={member.id.img} sx={{ width: 20, height: 20 }} />
                      <span style={{ fontSize: "12px", color: isSelected ? "#0094ea" : "inherit" }}>
                        {member.id.name || "Member"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </OutlinedBox>
          )}

          <OutlinedBox
            button
            activeButton
            style={{ marginTop: "14px" }}
            onClick={() => createWorkCard()}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Create Task"}
          </OutlinedBox>
        </>
      )}
    </Container>
  );
};

export default AddWork;
