const {validationResult } = require('express-validator');
const Post = require('../model/post');
const fs =  require('fs');
const path = require('path');

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error("Could not find post.");
                error.status = 404;
                throw error;
            }
            res.status(200).json({message: "Post found.", post: post});
        })
        .catch(err => {
            if (!err.statusCode) {
                console.log(err);
                err.statusCode = 500;
                next(err);
            }
        });
}

exports.getPosts = (req, res, next) => {
    const page = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    Post.countDocuments()
        .then(countDocuments => {
            totalItems = countDocuments;
            return Post.find({})
                    .skip((page - 1) * perPage)
                    .limit(perPage)
                    .lean()
        })
        .then(posts => {
            res.status(200).json({message: "Posts found,", posts: posts, totalItems: totalItems});
        })
        .catch(err => {
            if (!err.statusCode) {
                console.log(err);
                err.statusCode = 500;
                next(err);
            }
        });
}

exports.postPosts = (req, res, next) => {
    if (!req.file){
        const error = new Error("Could not find file.");
        error.statusCode = 422;
        throw error;
    }
    const imageUrl = req.file.path;
    const title = req.body.title;
    const content = req.body.content;
    const result = validationResult(req);
    if (!result.isEmpty()){
        const error = new Error("Validation failed, entered data is incorrect.");
        error.statusCode = 422;
        throw error;
    }
    const post = new Post({
        title: title,
        content: content,
        creator: {
            name: "John"
        },
        imageUrl: imageUrl
    })
    post.save()
        .then(response => {
            res.status(201).json({
                message: "Post created.",
                post: response
            })

        })
        .catch(err =>{
            if (!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.putPost = (req, res, next) => {
    const postId = req.params.postId;
    const result = validationResult(req);
    if (!result.isEmpty()){
        const error = new Error("Validation failed, entered data is incorrect.");
        error.statusCode = 422;
        throw error;
    }

    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    if (req.file) {
        imageUrl = req.file.path;
    }
    if (!imageUrl) {
        const error = new Error("No file.");
        error.statusCode = 422;
        throw error;
    }

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error("Post not found.");
                error.statusCode = 422;
                throw error;
            }
            if (imageUrl !== post.imageUrl){
                clearImage(post.imageUrl);
            }
            post.imageUrl = imageUrl;
            post.title = title;
            post.content = content;
            post.save()
            .then(response => {
                res.status(200).json({message: "Post updated.", post: response});
            })
            .catch(err =>{
                if (!err.statusCode){
                    err.statusCode = 500;
                }
                next(err);
            })
        })
        .catch(err =>{
            if (!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error("Post not found.");
                error.statusCode = 422;
                throw error;
            }
            const postImageUrl = post.imageUrl;
            post.deleteOne()
                .then(response => {
                    clearImage(postImageUrl);
                    res.status(201).json({message: "Post deleted."});
                })
                .catch(err => {
                    if (!err.statusCode){
                        err.statusCode = 500;
                    }
                    next(err);
                })
        })
        .catch(err =>{
            if (!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        })
}

const clearImage = filePath => {
    const fullFilePath = path.join(__dirname, "..", filePath);
    fs.unlink(fullFilePath, err => {console.log(err)});
}