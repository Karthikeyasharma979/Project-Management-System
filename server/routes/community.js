import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { createPost, deletePost, getPosts, likePost, addComment, getComments, updatePost } from "../controllers/community.js";

const router = express.Router();

//create a post
router.post("/", verifyToken, createPost);

//get all posts
router.get("/", verifyToken, getPosts);

//like a post
router.put("/like/:id", verifyToken, likePost);

//add a comment
router.post("/comments", verifyToken, addComment);

//get comments for a post
router.get("/comments/:postId", verifyToken, getComments);

//delete a post
router.delete("/:id", verifyToken, deletePost);

//update a post
router.put("/:id", verifyToken, updatePost);

export default router;
