import { ArrowBack, DoneAll, Send, Telegram } from '@mui/icons-material'
import { Avatar, IconButton } from '@mui/material'
import React, { useRef, useEffect, useState } from 'react'
import { getMessages, addMessage } from '../api'
import { format } from "timeago.js";
import styled from 'styled-components'

const Container = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
    background-color:  ${({ theme }) => theme.card};
`

const TopBar = styled.div`
    height: 70px;
    border-bottom: 1px solid ${({ theme }) => theme.soft};
    display: flex;
    align-items: center;
    padding: 0px 16px;
    @media (max-width: 800px) {
        height: 60px;
        padding: 0px 16px 0px 6px;
    }
`

const Chat = styled.div`
    flex: 1;
    overflow-y: scroll;
    padding: 20px 6px;
    background-color: ${({ theme }) => theme.chat_background};
    @media (max-width: 800px) {
        padding: 20px 0;
    }

`

const RecievedMessage = styled.p`
    margin: 16px 16px 0 16px;
    padding: 12px 16px;
    background-color: ${({ theme }) => theme.recieve_message};
    border-radius: 12px;
    color: ${({ theme }) => theme.text};
    font-size: 14px;
    max-width: 70%;
    width: fit-content;
    box-shadow: 0 0 6px rgba(0,0,0,0.2);
    position: relative;
    &:after {
        content: '';
        position: absolute;
        visibility: visible;
        top: 0px;
        left: -10px;
        border: 10px solid transparent;
        border-top: 10px solid ${({ theme }) => theme.recieve_message};
        clear: both;
    }
`

const SentMessage = styled.p`
    margin: 16px 16px 0 auto;
    padding: 12px 16px;
    background-color: ${({ theme }) => theme.send_message};
    border-radius: 12px 0px 12px 12px;
    color: ${({ theme }) => theme.send_message_text_color};
    font-size: 14px;
    max-width: 70%;
    width: fit-content;
    box-shadow: 0 0 6px rgba(0,0,0,0.4);
    position: relative;
    &:after {
        content: '';
        position: absolute;
        visibility: visible;
        top: 0px;
        right: -10px;
        border: 10px solid transparent;
        border-top: 10px solid ${({ theme }) => theme.send_message};
        clear: both;
    }
`

const Time = styled.span`
    font-size: 12px;
    padding: 10px 16px;
    color: ${({ theme }) => theme.soft2};
    margin: 0 16px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    ${({ message }) => message === 'recieved' && `
        justify-content: flex-start;
    `}
`

const SendMessage = styled.div`
    min-height: 70px;
    border-top: 1px solid ${({ theme }) => theme.soft};
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 10px;
    @media (max-width: 800px) {
        position: fixed;
        background-color: ${({ theme }) => theme.card};
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 100;
        gap: 6px;
        padding: 0 2px;
    }
`

const Profile = styled.div`
    display: flex;
    flex-direction: column;
    margin-left: 16px;
    gap: 4px;
`
const Name = styled.span`
    font-weight: 600;
    font-size: 16px;
    color: ${({ theme }) => theme.text};
`
const Status = styled.span`
    font-size: 12px;
    color: ${({ theme }) => theme.text};
`

const MessageBox = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background-color: ${({ theme }) => theme.bg};
    border-radius: 12px;
    padding: 16px 8px;
`

const Message = styled.input`
    border: none;
    flex: 1;
    height: 100%;
    width: 100%;
    background-color: transparent;
    color: ${({ theme }) => theme.text};
    font-size: 16px;
    padding: 0 16px;
    &:focus {
        outline: none;
    }
`;


const SenderName = styled.span`
    font-size: 12px;
    color: ${({ theme }) => theme.textSoft};
    margin: 0 0 2px 18px;
    font-weight: 500;
`

const ChatContainer = ({ showChat, setShowChat, currentChat, currentUser, socket }) => {

    const [width, setWidth] = React.useState(window.innerWidth)
    const breakpoint = 768

    useEffect(() => {
        const handleWindowResize = () => setWidth(window.innerWidth)
        window.addEventListener("resize", handleWindowResize)
        return () => window.removeEventListener("resize", handleWindowResize)
    }, [])

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null)

    useEffect(() => {
        const fetchMessages = async () => {
            if (currentChat) {
                try {
                    const token = localStorage.getItem("token");
                    const res = await getMessages(currentChat._id, token);
                    setMessages(res.data);
                    if (socket) {
                        socket.emit("join-chat", currentChat._id);
                    }
                } catch (err) {
                    console.log(err);
                }
            }
        };
        if (currentChat) fetchMessages();
    }, [currentChat, currentUser, socket]);

    useEffect(() => {
        if (socket) {
            socket.on("msg-recieve", (msg) => {
                if (currentChat && msg.chatId === currentChat._id) {
                    setMessages((prev) => prev.some(m => m._id === msg._id) ? prev : [...prev, msg]);
                }
            });
        }
        return () => {
            if (socket) {
                socket.off("msg-recieve");
            }
        }
    }, [currentChat, socket]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage) return;
        const message = {
            text: newMessage,
            chatId: currentChat._id,
        };
        try {
            const token = localStorage.getItem("token");
            const res = await addMessage(message, token);
            setMessages((prev) => prev.some(m => m._id === res.data._id) ? prev : [...prev, res.data]);
            setNewMessage("");
            if (socket) {
                socket.emit("send-msg", res.data);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    useEffect(scrollToBottom, [messages]);

    const otherMember = currentChat?.members?.find((member) => member._id !== currentUser._id);

    const getSender = (senderId) => {
        return currentChat?.members?.find((member) => member._id === senderId);
    }

    return (
        <Container>
            {currentChat ?
                <>
                    <TopBar>
                        {width < breakpoint &&
                            <IconButton style={{ color: 'inherit' }} onClick={() => setShowChat(false)}>
                                <ArrowBack sx={{ width: "24px", height: '24px' }} />
                            </IconButton>}
                        <Avatar sx={{ width: "46px", height: '46px' }} src={otherMember?.img} />
                        <Profile>
                            <Name>{otherMember?.name}</Name>
                            <Status>Online</Status>
                        </Profile>
                    </TopBar>
                    <Chat>
                        {messages.map((m) => (
                            <div key={m._id}>
                                {m.senderId === currentUser._id ?
                                    <>
                                        <SentMessage key={m._id}>{m.text}</SentMessage>
                                        <Time message="sent"><b>{format(m.createdAt)}</b><DoneAll /></Time>
                                    </>
                                    :
                                    <div style={{ display: 'flex', flexDirection: 'column', marginTop: '16px' }}>
                                        <SenderName>{getSender(m.senderId)?.name}</SenderName>
                                        <RecievedMessage key={m._id} style={{ margin: '0 16px 0 16px' }}>{m.text}</RecievedMessage>
                                        <Time message="recieved"><b>{format(m.createdAt)}</b></Time>
                                    </div>
                                }
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </Chat>
                    <SendMessage>
                        <MessageBox>
                            <Message placeholder="Type a message" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSend(e) }} />
                        </MessageBox>
                        <IconButton style={{ color: 'inherit', marginBottom: '6px' }} onClick={handleSend}>
                            <Telegram sx={{ height: '30px', width: '30px' }} />
                        </IconButton>
                    </SendMessage>
                </>
                :
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'grey' }}>
                    Select a chat to start messaging
                </div>
            }
        </Container>
    )
}

export default ChatContainer