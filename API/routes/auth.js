const express = require('express');
const router = express.Router();
const {body} = require('express-validator');
const User = require('../model/user');
const authController = require('../controllers/auth');

router.put('/signup',
    [
        body('email')
            .notEmpty()
            .trim()
            .isEmail()
            .withMessage('Valid Email is required')
            .normalizeEmail()
            .custom((value, {req}) => {
                return User.findOne({email: value})
                    .then(email => {
                        if (email) {
                            return Promise.reject("Email already exists!");
                        }
                        return Promise.resolve();
                    })
                    .catch(err =>{
                        throw err;
                    });
            }),
        body("password")
            .notEmpty()
            .trim()
            .isLength({min: 5}),
        body("name")
            .notEmpty()
            .trim()
    ],
    authController.signup);

module.exports = router;