import Post from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import { createError } from "../error.js";

export const createPost = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            console.log("User not found for ID:", req.user.id);
            return next(createError(404, "User not found"));
        }
        console.log("Creating post for user:", user.name);
        const { desc } = req.body;
        if (!desc) return next(createError(400, "Description is required"));

        const newPost = new Post({
            desc,
            userId: req.user.id,
            name: user.name || "Anonymous",
            img: user.img || ""
        });
        console.log("New Post Object:", newPost);
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    } catch (err) {
        console.log("Create Post Error:", err);
        next(err);
    }
};

export const getPosts = async (req, res, next) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (err) {
        next(err);
    }
};

export const likePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.user.id)) {
            await post.updateOne({ $push: { likes: req.user.id } });
            res.status(200).json("The post has been liked");
        } else {
            await post.updateOne({ $pull: { likes: req.user.id } });
            res.status(200).json("The post has been disliked");
        }
    } catch (err) {
        console.log("Like Post Error:", err);
        next(err);
    }
}

export const addComment = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return next(createError(404, "User not found"));

        const newComment = new Comment({
            ...req.body,
            userId: req.user.id,
            name: user.name,
            img: user.img
        });
        const savedComment = await newComment.save();

        // Update post to include comment id
        await Post.findByIdAndUpdate(req.body.postId, {
            $push: { comments: savedComment._id },
        });

        res.status(200).json(savedComment);
    } catch (err) {
        next(err);
    }
};

export const getComments = async (req, res, next) => {
    try {
        const comments = await Comment.find({ postId: req.params.postId }).sort({ createdAt: -1 });
        res.status(200).json(comments);
    } catch (err) {
        next(err);
    }
};

export const deletePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.user.id) {
            await post.deleteOne();
            res.status(200).json("The post has been deleted");
        } else {
            return next(createError(403, "You can delete only your post!"));
        }
    } catch (err) {
        next(err);
    }
};

export const updatePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.user.id) {
            await post.updateOne({ $set: req.body });
            res.status(200).json("The post has been updated");
        } else {
            return next(createError(403, "You can update only your post!"));
        }
    } catch (err) {
        next(err);
    }
};
