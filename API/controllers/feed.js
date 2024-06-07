const {validationResult } = require('express-validator');
const Post = require('../model/post');

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
    Post.find({})
        .lean()
        .then(posts => {
            res.status(200).json({message: "Posts found,", posts: posts});
        })
        .catch(err => {
            if (!err.statusCode) {
                console.log(err);
                err.statusCode = 500;
                next(err);
            }
        })

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