const User = require('../model/user');
const {validationResult } = require('express-validator');
const bcrypt = require("bcryptjs");

exports.signup = (req, res, next) => {
    const response = validationResult(req);
    if (!response.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = response.array();
        throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    bcrypt.hash(req.body.password, 10, (error, result) => {
        if (error){
            console.log(error);
            error.statusCode = 500;
            return next(error);
        }
        const newUser = new User({
            name: name,
            email: email,
            password: result,
            posts: []
        });
        newUser.save()
            .then(user => {
                res.status(201).json({message: "User saved.", userId: user._id});
            })
            .catch(err => {
                if (!err.statusCode) {
                    console.log(err);
                    err.statusCode = 500;
                    next(err);
                }
            });
    });

}