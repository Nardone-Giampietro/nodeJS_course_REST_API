const {validationResult } = require('express-validator');
const Post = require('../model/post');
const User = require('../model/user');
const fs =  require('fs');
const path = require('path');
const { getIo } = require('../socket');

exports.getPost = async (req, res, next) => {
    const postId = req.params.postId;
    try {
        const post  = await Post.findById(postId);
        if (!post) {
            const error = new Error("Could not find post.");
            error.statusCode = 404;
            return next(error);
        }
        res.status(200).json({message: "Post found.", post: post});
    }
    catch (err) {
        if (!err.statusCode) {
            console.log(err);
            err.statusCode = 500;
            next(err);
        }
    }
}

exports.getPosts = async (req, res, next) => {
    const page = req.query.page || 1;
    const perPage = 2;
    try {
        const totalItems = await Post.countDocuments();
        const posts = await Post.find({})
            .populate("creator")
            .sort({ createdAt: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage).exec();
        res.status(200).json({message: "Posts found,", posts: posts, totalItems: totalItems});
    }
    catch (err) {
        if (!err.statusCode) {
            console.log(err);
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.postPosts = async (req, res, next) => {
    if (!req.file){
        const error = new Error("Could not find file.");
        error.statusCode = 422;
        return next(error);
    }
    const imageUrl = req.file.path;
    const userId = req.userId;
    const title = req.body.title;
    const content = req.body.content;
    const result = validationResult(req);
    if (!result.isEmpty()){
        const error = new Error("Validation failed, entered data is incorrect.");
        error.statusCode = 422;
        return next(error);
    }

    const post = new Post({
        title: title,
        content: content,
        creator: userId,
        imageUrl: imageUrl
    })
    try {
       const newPost = await post.save();
       const user = await User.findById(userId);
       user.posts.push(newPost);
       newPost.creator = await user.save();
       getIo().emit('postPost', {
               action: "create",
               post: newPost
           });
       res.status(201).json({
            message: "Post created.",
            post: newPost,
            creator: user.name
       });
    }
    catch (err) {
        err.statusCode = 500;
        clearImage(imageUrl);
        next(err);
    }
}

exports.putPost = async (req, res, next) => {
    const postId = req.params.postId;
    let imageUrl = req.body.image;
    const result = validationResult(req);
    if (!result.isEmpty()){
        const error = new Error("Validation failed, entered data is incorrect.");
        error.statusCode = 422;
        if (req.file){
            clearImage(req.file.path);
        }
        return next(error);
    }
    const title = req.body.title;
    const content = req.body.content;
    if (req.file) {
        imageUrl = req.file.path;
    }
    if (!imageUrl) {
        const error = new Error("No file.");
        error.statusCode = 422;
        return next(error);
    }

    try {
        const post = await Post.findById(postId).populate("creator");
        if (!post) {
            const error = new Error("Post not found.");
            error.statusCode = 422;
            return next(error);
        }
        if (imageUrl !== post.imageUrl){
            clearImage(post.imageUrl);
        }
        post.imageUrl = imageUrl;
        post.title = title;
        post.content = content;
        const updatedPost = await post.save();
        getIo().emit('postPost', {
            action: "update",
            post: updatedPost
        });
        res.status(200).json({message: "Post updated.", post: updatedPost});
    }
    catch (err) {
        if (!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId;
    const result = validationResult(req);
    if (!result.isEmpty()){
        const error = new Error("Validation failed, entered data is incorrect.");
        error.statusCode = 422;
        return next(error);
    }

    try {
        const post = await Post.findById(postId);
        if (!post) {
            const error = new Error("Post not found.");
            error.statusCode = 422;
            return  next(error);
        }
        const postUserId = post.creator;
        const postImageUrl = post.imageUrl;
        await post.deleteOne();
        clearImage(postImageUrl);
        const user = await User.findById(postUserId);
        user.posts.pull(postId);
        await user.save();
        getIo().emit("postPost", {
            action: "delete",
            post: postId
        })
        res.status(201).json({message: "Post deleted."});
    }
    catch (err) {
        if (!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}

const clearImage = filePath => {
    const fullFilePath = path.join(__dirname, "..", filePath);
    fs.unlink(fullFilePath, err => {console.log(err)});
}