const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feed');
const {body} = require("express-validator");

// GET /feed/post:postId
router.get("/post/:postId", feedController.getPost);

// GET /feed/posts
router.get("/posts", feedController.getPosts);

// POST /feed/post
router.post("/post",
    [
        body("title")
            .notEmpty()
            .trim()
            .isLength({min: 5}),
        body("content")
            .notEmpty()
            .trim()
            .isLength({min: 5}),
    ]
    ,feedController.postPosts);

module.exports = router;