const express = require('express');
const router = express.Router();
const statusController = require('../controllers/status');
const {isAuth} = require('../utils/authentication');
const {body} = require("express-validator");

// GET /status
router.get('/',isAuth, statusController.getStatus);

// PUT /status
router.put("/",isAuth,
    [
        body("status")
            .notEmpty()
            .trim()
            .isLength({min: 3})
    ]
    ,statusController.putStatus);

module.exports = router;