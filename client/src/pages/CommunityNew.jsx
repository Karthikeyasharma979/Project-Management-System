import React, { useState, useEffect } from "react";
import styled, { keyframes, useTheme } from "styled-components";
import { Avatar, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import {
  Favorite, FavoriteBorder, ChatBubbleOutline, Share, MoreHoriz, DeleteOutline, Edit,
  Send, TrendingUp, People, Public, AutoAwesome, Image, Link
} from "@mui/icons-material";
import { GalaxyButton, PremiumLoader, GlassCard } from "../components/CreativeComponents";
import { useDispatch, useSelector } from "react-redux";
import { openSnackbar } from "../redux/snackbarSlice";
import { getPosts, createPost, likePost, addComment, getComments, deletePost, updatePost } from "../api";
import { format } from "timeago.js";

// ─── Animations ────────────────────────────────────────────────────────────────

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
`;

const heartBeat = keyframes`
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.2); }
  75% { transform: scale(0.95); }
`;

// ─── Layout ────────────────────────────────────────────────────────────────────

const Container = styled.div`
  padding: 28px 32px;
  background: ${({ theme }) => theme.bg};
  min-height: 100%;
`;

const ContentGrid = styled.div`
  max-width: 1200px;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 28px;
  align-items: start;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
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
  animation: ${float} 4s ease-in-out infinite;
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

// ─── Post Composer ─────────────────────────────────────────────────────────────

const ComposerCard = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  animation: ${fadeInUp} 0.5s ease-out;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: ${({ theme }) => theme.primary + "60"};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.primary + "12"};
  }
`;

const ComposerTop = styled.div`
  display: flex;
  gap: 14px;
  align-items: flex-start;
  margin-bottom: 14px;
`;

const StyledTextarea = styled.textarea`
  flex: 1;
  border: none;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};
  padding: 14px 16px;
  border-radius: 14px;
  font-size: 14px;
  resize: none;
  min-height: 80px;
  font-family: inherit;
  outline: none;
  width: 100%;
  transition: all 0.2s;
  line-height: 1.6;

  &::placeholder { color: ${({ theme }) => theme.textMuted || theme.textSoft}; }
  &:focus { background: ${({ theme }) => theme.bgCard || theme.bgLighter}; }
`;

const ComposerActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const ComposerTools = styled.div`
  display: flex;
  gap: 4px;
`;

const ToolBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.textSoft};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;

  svg { font-size: 16px; }

  &:hover {
    background: ${({ theme }) => theme.itemHover};
    color: ${({ theme }) => theme.primary};
  }
`;

// ─── Post Card ─────────────────────────────────────────────────────────────────

const PostCard = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 20px;
  padding: 22px;
  margin-bottom: 16px;
  transition: all 0.25s ease;
  animation: ${fadeInUp} 0.5s ease-out;

  &:hover {
    border-color: ${({ theme }) => theme.primary + "40"};
    box-shadow: 0 8px 32px ${({ theme }) => theme.primary + "12"};
  }
`;

const PostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserDetails = styled.div``;

const UserName = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
`;

const PostMeta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.textSoft};
  margin-top: 2px;
`;

const PostContent = styled.p`
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  line-height: 1.7;
  margin: 0 0 16px;
  white-space: pre-line;
`;

const PostImage = styled.img`
  width: 100%;
  border-radius: 14px;
  margin-bottom: 16px;
  max-height: 380px;
  object-fit: cover;
  border: 1px solid ${({ theme }) => theme.border};
`;

const InteractionBar = styled.div`
  display: flex;
  gap: 4px;
  padding-top: 14px;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const InteractionBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 14px;
  border-radius: 10px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  color: ${({ $liked, theme }) => $liked ? theme.red || "#FF5252" : theme.textSoft};

  svg {
    font-size: 17px;
    animation: ${({ $liked }) => $liked ? heartBeat : "none"} 0.3s ease;
  }

  &:hover {
    background: ${({ $liked, theme }) => $liked ? "rgba(255,82,82,0.1)" : theme.itemHover};
    color: ${({ $liked, theme }) => $liked ? theme.red || "#FF5252" : theme.text};
  }
`;

// ─── Comments Section ─────────────────────────────────────────────────────────

const CommentsSection = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const CommentItem = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
`;

const CommentBubble = styled.div`
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 14px;
  padding: 10px 14px;
  flex: 1;
`;

const CommentName = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
`;

const CommentText = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.textSoft};
  margin: 4px 0 0;
  line-height: 1.5;
`;

const CommentTime = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.textMuted || theme.textSoft};
  opacity: 0.7;
`;

const CommentInputRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 12px;
`;

const CommentInput = styled.input`
  flex: 1;
  background: ${({ theme }) => theme.bg};
  border: 1.5px solid ${({ theme }) => theme.border};
  padding: 9px 16px;
  border-radius: 50px;
  color: ${({ theme }) => theme.text};
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: all 0.2s;

  &::placeholder { color: ${({ theme }) => theme.textMuted || theme.textSoft}; }
  &:focus { border-color: ${({ theme }) => theme.primary}; }
`;

const SendBtn = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: ${({ theme }) => theme.gradientPrimary || "linear-gradient(135deg, #7C4DFF, #9C6FFF)"};
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;

  svg { font-size: 15px; }

  &:hover { transform: scale(1.1); }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`;

// ─── Sidebar ────────────────────────────────────────────────────────────────────

const SidebarCard = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 20px;
  padding: 20px;
  animation: ${fadeInUp} 0.6s ease-out;

  & + & { margin-top: 16px; }
`;

const SidebarTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TrendingItem = styled.div`
  padding: 10px 12px;
  margin: 0 -12px;
  border-radius: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ $active, theme }) => $active ? theme.itemHover || "rgba(124, 77, 255, 0.05)" : "transparent"};

  &:last-child { border-bottom: none; }

  h5 {
     color: ${({ $active, theme }) => $active ? theme.primary : theme.text};
     transition: color 0.2s;
  }

  &:hover {
     background: ${({ theme }) => theme.itemHover || "rgba(124, 77, 255, 0.05)"};
  }
  &:hover h5 { color: ${({ theme }) => theme.primary}; }
`;

const TrendTag = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.textMuted || theme.textSoft};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 3px;
`;

const TrendTopic = styled.h5`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0;
  transition: color 0.2s;
`;

const TrendCount = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.textSoft};
  margin-top: 2px;
  display: block;
`;

const CommunityStatRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid ${({ theme }) => theme.border};

  &:last-child { border-bottom: none; padding-bottom: 0; }
`;

const CommunityStatIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${({ $bg }) => $bg || "rgba(124,77,255,0.12)"};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $color }) => $color || "#7C4DFF"};
  font-size: 18px;
  flex-shrink: 0;
`;

const CommunityStatText = styled.div`
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  span { display: block; font-size: 12px; font-weight: 400; color: ${({ theme }) => theme.textSoft}; }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.textSoft};
  .emoji { font-size: 48px; margin-bottom: 16px; display: block; }
  h3 { font-size: 18px; font-weight: 700; color: ${({ theme }) => theme.text}; margin-bottom: 6px; }
  p { font-size: 14px; }
`;

// ─── Component ─────────────────────────────────────────────────────────────────

const CommunityNew = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [postLoading, setPostLoading] = useState(false);
  const [openComments, setOpenComments] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [editPostId, setEditPostId] = useState(null);
  const [editPostDesc, setEditPostDesc] = useState("");
  
  // Menu State
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuPostId, setMenuPostId] = useState(null);

  const handleMenuOpen = (event, postId) => {
    setAnchorEl(event.currentTarget);
    setMenuPostId(postId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuPostId(null);
  };

  const trendingTopics = React.useMemo(() => {
    const tagCounts = {};
    posts.forEach(post => {
      const desc = post.desc || "";
      const matches = desc.match(/#[\w]+/g);
      if (matches) {
        matches.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const calculatedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5) // Top 5
      .map(([topic, count]) => ({
        tag: "Trending", 
        topic,
        count: `${count} post${count > 1 ? 's' : ''}`
      }));

    return calculatedTags;
  }, [posts]);

  const filteredPosts = React.useMemo(() => {
      if (!selectedTag) return posts;
      return posts.filter(post => (post.desc || "").toLowerCase().includes(selectedTag.toLowerCase()));
  }, [posts, selectedTag]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await getPosts(token);
        setPosts(res.data);
        setLoading(false);
      } catch (err) {
        dispatch(openSnackbar({ message: err.response?.data?.message || err.message, type: "error" }));
        setLoading(false);
      }
    };
    if (currentUser) fetchPosts();
  }, [currentUser, dispatch]);

  const handleLike = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await likePost(id, token);
      setPosts(posts.map(post =>
        post._id === id
          ? {
            ...post,
            likes: post.likes.includes(currentUser._id)
              ? post.likes.filter(uid => uid !== currentUser._id)
              : [...post.likes, currentUser._id]
          }
          : post
      ));
    } catch (err) {
      dispatch(openSnackbar({ message: "Failed to like post", type: "error" }));
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    setPostLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await createPost({ desc: newPost }, token);
      setPosts([res.data, ...posts]);
      setNewPost("");
      dispatch(openSnackbar({ message: "Post created!", type: "success" }));
      setPostLoading(false);
    } catch (err) {
      dispatch(openSnackbar({ message: err.response?.data?.message || err.message, type: "error" }));
      setPostLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      await deletePost(postId, token);
      setPosts(posts.filter((p) => p._id !== postId));
      dispatch(openSnackbar({ message: "Post deleted successfully", type: "success" }));
    } catch (err) {
      dispatch(openSnackbar({ message: err.response?.data?.message || "Failed to delete post", type: "error" }));
    }
  };

  const handleUpdatePost = async (postId) => {
    if (!editPostDesc.trim()) return;
    setPostLoading(true);
    try {
      const token = localStorage.getItem("token");
      await updatePost(postId, { desc: editPostDesc }, token);
      setPosts(posts.map(p => p._id === postId ? { ...p, desc: editPostDesc } : p));
      setEditPostId(null);
      setEditPostDesc("");
      dispatch(openSnackbar({ message: "Post updated successfully", type: "success" }));
      setPostLoading(false);
    } catch (err) {
      dispatch(openSnackbar({ message: err.response?.data?.message || "Failed to update post", type: "error" }));
      setPostLoading(false);
    }
  };

  const isLiked = (post) => post.likes?.includes(currentUser?._id);

  const handleCommentClick = async (postId) => {
    if (openComments === postId) {
      setOpenComments(null);
      setComments([]);
      return;
    }
    setOpenComments(postId);
    try {
      const token = localStorage.getItem("token");
      const res = await getComments(postId, token);
      setComments(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await addComment({ postId, desc: commentText }, token);
      setComments([res.data, ...comments]);
      setCommentText("");
      setPosts(posts.map(p => p._id === postId ? { ...p, comments: [...p.comments, res.data._id] } : p));
      setCommentLoading(false);
    } catch (err) {
      dispatch(openSnackbar({ message: err.response?.data?.message || err.message, type: "error" }));
      setCommentLoading(false);
    }
  };

  return (
    <Container>
      {/* Header */}
      <PageHeader>
        <TitleRow>
          <TitleIcon>
            <Public />
          </TitleIcon>
          <PageTitle>Community Hub</PageTitle>
        </TitleRow>
        <PageSubtitle>Connect, share ideas, and grow together with your team</PageSubtitle>
      </PageHeader>

      <ContentGrid>
        {/* Main Feed */}
        <div>
          {/* Composer */}
          <ComposerCard>
            <ComposerTop>
              <Avatar
                src={currentUser?.img}
                sx={{ width: 40, height: 40, flexShrink: 0 }}
              >
                {currentUser?.name?.[0]}
              </Avatar>
              <StyledTextarea
                placeholder={`What's on your mind, ${currentUser?.name?.split(' ')[0]}?`}
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleCreatePost();
                }}
              />
            </ComposerTop>
            <ComposerActions style={{ justifyContent: 'flex-end' }}>
              <GalaxyButton
                style={{ padding: '9px 20px', fontSize: '13px' }}
                onClick={handleCreatePost}
                disabled={postLoading || !newPost.trim()}
              >
                <Send style={{ fontSize: 15 }} />
                {postLoading ? "Posting..." : "Post"}
              </GalaxyButton>
            </ComposerActions>
          </ComposerCard>

          {/* Posts */}
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
              <PremiumLoader />
            </div>
          ) : filteredPosts.length === 0 ? (
            <EmptyState>
              <span className="emoji">✨</span>
              {selectedTag ? (
                 <>
                    <h3>No posts found for {selectedTag}</h3>
                    <p>Try selecting a different topic or clear the filter.</p>
                 </>
              ) : (
                 <>
                    <h3>No posts yet</h3>
                    <p>Be the first to share something with the community!</p>
                 </>
              )}
            </EmptyState>
          ) : (
            filteredPosts.map((post) => (
              <PostCard key={post._id}>
                <PostHeader>
                  <UserInfo>
                    <Avatar src={post.img} sx={{ width: 42, height: 42 }}>
                      {post.name?.[0]}
                    </Avatar>
                    <UserDetails>
                      <UserName>{post.name}</UserName>
                      <PostMeta>{format(post.createdAt)}</PostMeta>
                    </UserDetails>
                  </UserInfo>
                  <>
                    <IconButton size="small" sx={{ color: theme.textSoft }} onClick={(e) => handleMenuOpen(e, post._id)}>
                      <MoreHoriz fontSize="small" />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && menuPostId === post._id}
                      onClose={handleMenuClose}
                      PaperProps={{
                        style: {
                          backgroundColor: theme.bgCard || theme.bgLighter || "#1E1E2D",
                          color: theme.text,
                          boxShadow: `0 8px 32px rgba(0,0,0,0.2)`,
                          borderRadius: '12px',
                          border: `1px solid ${theme.border}`,
                          marginTop: '8px'
                        }
                      }}
                    >
                      {currentUser?._id === post.userId && (
                        <MenuItem onClick={() => { handleMenuClose(); setEditPostId(post._id); setEditPostDesc(post.desc); }}>
                          <ListItemIcon><Edit fontSize="small" sx={{ color: theme.textSoft }} /></ListItemIcon>
                          <ListItemText primary="Edit Post" sx={{ span: { fontSize: '13px', fontWeight: 500 } }}/>
                        </MenuItem>
                      )}
                      
                      <MenuItem onClick={() => { handleMenuClose(); navigator.clipboard.writeText(window.location.href); dispatch(openSnackbar({ message: "Link copied to clipboard!", type: "success" })); }}>
                        <ListItemIcon><Link fontSize="small" sx={{ color: theme.textSoft }} /></ListItemIcon>
                        <ListItemText primary="Copy Link" sx={{ span: { fontSize: '13px', fontWeight: 500 } }}/>
                      </MenuItem>
                      
                      {currentUser?._id === post.userId && (
                        <MenuItem onClick={() => { handleDeletePost(post._id); handleMenuClose(); }} sx={{ color: theme.red || "#FF5252" }}>
                          <ListItemIcon><DeleteOutline fontSize="small" sx={{ color: theme.red || "#FF5252" }} /></ListItemIcon>
                          <ListItemText primary="Delete Post" sx={{ span: { fontSize: '13px', fontWeight: 500 } }}/>
                        </MenuItem>
                      )}
                    </Menu>
                  </>
                </PostHeader>

                {editPostId === post._id ? (
                  <div style={{ marginBottom: 16 }}>
                    <StyledTextarea
                      value={editPostDesc}
                      onChange={(e) => setEditPostDesc(e.target.value)}
                      style={{ minHeight: "80px", border: `1px solid ${theme.border}`, marginBottom: 12, padding: "12px", background: theme.bg }}
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                      <GalaxyButton 
                        style={{ padding: '7px 16px', fontSize: '13px', background: 'transparent', color: theme.text, border: `1px solid ${theme.border}` }} 
                        onClick={() => { setEditPostId(null); setEditPostDesc(""); }}
                      >
                        Cancel
                      </GalaxyButton>
                      <GalaxyButton 
                        style={{ padding: '7px 16px', fontSize: '13px' }} 
                        onClick={() => handleUpdatePost(post._id)}
                        disabled={postLoading || !editPostDesc.trim() || editPostDesc === post.desc}
                      >
                        Save Changes
                      </GalaxyButton>
                    </div>
                  </div>
                ) : (
                  <PostContent>{post.desc}</PostContent>
                )}
                
                {post.img && <PostImage src={post.img} alt="Post" />}

                <InteractionBar>
                  <InteractionBtn $liked={isLiked(post)} onClick={() => handleLike(post._id)}>
                    {isLiked(post) ? <Favorite /> : <FavoriteBorder />}
                    {post.likes?.length || 0}
                  </InteractionBtn>
                  <InteractionBtn onClick={() => handleCommentClick(post._id)}>
                    <ChatBubbleOutline />
                    {post.comments?.length || 0}
                  </InteractionBtn>
                  <InteractionBtn>
                    <Share />
                    Share
                  </InteractionBtn>
                </InteractionBar>

                {openComments === post._id && (
                  <CommentsSection>
                    {comments.map((comment) => (
                      <CommentItem key={comment._id}>
                        <Avatar src={comment.img} sx={{ width: 30, height: 30, fontSize: 12, flexShrink: 0 }}>
                          {comment.name?.[0]}
                        </Avatar>
                        <CommentBubble>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <CommentName>{comment.name}</CommentName>
                            <CommentTime>{format(comment.createdAt)}</CommentTime>
                          </div>
                          <CommentText>{comment.desc}</CommentText>
                        </CommentBubble>
                      </CommentItem>
                    ))}
                    {comments.length === 0 && (
                      <div style={{ fontSize: 13, color: theme.textSoft, marginBottom: 12, textAlign: 'center' }}>
                        No comments yet. Start the conversation!
                      </div>
                    )}
                    <CommentInputRow>
                      <Avatar src={currentUser?.img} sx={{ width: 30, height: 30, fontSize: 12, flexShrink: 0 }}>
                        {currentUser?.name?.[0]}
                      </Avatar>
                      <CommentInput
                        placeholder="Write a comment... (Press Enter to send)"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                      />
                      <SendBtn
                        onClick={() => handleAddComment(post._id)}
                        disabled={commentLoading || !commentText.trim()}
                      >
                        <Send />
                      </SendBtn>
                    </CommentInputRow>
                  </CommentsSection>
                )}
              </PostCard>
            ))
          )}
        </div>

        {/* Sidebar */}
        <div>
          <SidebarCard>
            <SidebarTitle>
              <TrendingUp style={{ color: theme.primary, fontSize: 18 }} />
              Trending Topics
              {selectedTag && (
                <span 
                  style={{fontSize: 12, marginLeft: "auto", color: theme.textSoft, cursor: "pointer", fontWeight: 'normal'}}
                  onClick={() => setSelectedTag(null)}
                >
                  Clear Filter
                </span>
              )}
            </SidebarTitle>
            {trendingTopics.length > 0 ? (
              trendingTopics.map((item, i) => (
                <TrendingItem 
                  key={i} 
                  $active={selectedTag === item.topic} 
                  onClick={() => setSelectedTag(selectedTag === item.topic ? null : item.topic)}
                >
                  <TrendTag>{item.tag}</TrendTag>
                  <TrendTopic>{item.topic}</TrendTopic>
                  <TrendCount>{item.count}</TrendCount>
                </TrendingItem>
              ))
            ) : (
                <div style={{ fontSize: 13, color: theme.textSoft, textAlign: "center", padding: "10px 0" }}>
                   No trending topics yet. Use hashtags in your posts to start one!
                </div>
            )}
          </SidebarCard>

          <SidebarCard style={{ marginTop: 16 }}>
            <SidebarTitle>
              <People style={{ color: theme.accentGreen || "#00E5A0", fontSize: 18 }} />
              Community Stats
            </SidebarTitle>
            <CommunityStatRow>
              <CommunityStatIcon $bg="rgba(124,77,255,0.12)" $color={theme.primary}>
                <Public style={{ fontSize: 18 }} />
              </CommunityStatIcon>
              <CommunityStatText>
                {posts.length} Total Posts
                <span>Community contributions</span>
              </CommunityStatText>
            </CommunityStatRow>
            <CommunityStatRow>
              <CommunityStatIcon $bg="rgba(0,229,160,0.12)" $color={theme.accentGreen || "#00E5A0"}>
                <Favorite style={{ fontSize: 18 }} />
              </CommunityStatIcon>
              <CommunityStatText>
                {posts.reduce((acc, p) => acc + (p.likes?.length || 0), 0)} Total Likes
                <span>Across all posts</span>
              </CommunityStatText>
            </CommunityStatRow>
            <CommunityStatRow>
              <CommunityStatIcon $bg="rgba(0,212,255,0.12)" $color={theme.accent || "#00D4FF"}>
                <ChatBubbleOutline style={{ fontSize: 18 }} />
              </CommunityStatIcon>
              <CommunityStatText>
                {posts.reduce((acc, p) => acc + (p.comments?.length || 0), 0)} Comments
                <span>Total discussions</span>
              </CommunityStatText>
            </CommunityStatRow>
          </SidebarCard>
        </div>
      </ContentGrid>
    </Container>
  );
};

export default CommunityNew;
