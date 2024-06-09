const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feed');
const {body, param} = require("express-validator");
const {isAuth} = require("../utils/authentication");
const Post = require("../model/post");

// GET /feed/post/:postId
router.get("/post/:postId",isAuth, feedController.getPost);

// GET /feed/posts
router.get("/posts",isAuth, feedController.getPosts);

// POST /feed/post
router.post("/post", isAuth,
    [
        body("title")
            .notEmpty()
            .trim()
            .isLength({min: 5}),
        body("content")
            .notEmpty()
            .trim()
            .isLength({min: 5})
    ]
    ,feedController.postPosts);

// PUT /feed/post/:postId
router.put("/post/:postId", isAuth,
    [
        body("title")
            .notEmpty()
            .trim()
            .isLength({min: 5}),
        body("content")
            .notEmpty()
            .trim()
            .isLength({min: 5}),
        param("postId")
            .trim()
            .custom((value, {req}) => {
                return Post.findById(value)
                    .then(post => {
                        if (!post){
                            return Promise.reject("Post not found.");
                        }
                        if (post.creator.toString() !== req.userId.toString()){
                            return Promise.reject("Not authorized.");
                        }
                        return Promise.resolve();
                    })
                    .catch(error => {
                        return Promise.reject(error);
                    })
            })
    ]
    ,feedController.putPost);

// DELETE /feed/post/:postId
router.delete("/post/:postId",isAuth,
    [
    param("postId")
        .trim()
        .custom((value, {req}) => {
            return Post.findById(value)
                .then(post => {
                    if (!post){
                        return Promise.reject("Post not found.");
                    }
                    if (post.creator.toString() !== req.userId.toString()){
                        return Promise.reject("Not authorized.");
                    }
                    return Promise.resolve();
                })
                .catch(error => {
                    return Promise.reject(error);
                })
        })
    ],
    feedController.deletePost);

module.exports = router;