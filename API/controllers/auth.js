const User = require('../model/user');
const {validationResult } = require('express-validator');
const {createJWToken} = require('../utils/authentication');
const bcrypt = require("bcryptjs");

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadUser;
    User.findOne({email: email})
        .lean()
        .then(user => {
            if (!user) {
                const error = new Error("Could not find user");
                error.statusCode = 404;
                throw error;
            }
            loadUser = user;
            return bcrypt.compare(password, loadUser.password)
                .then(result => {
                    if (!result) {
                        const error = new Error("Incorrect Password.");
                        error.statusCode = 422;
                        throw error;
                    }
                const token = createJWToken(loadUser);
                res.status(200).json({token: token, userId: loadUser._id});
                })
                .catch(err => {
                    if (!err.statusCode) {
                        console.log(err);
                        err.statusCode = 500;
                    }
                    next(err);
                })
        })
        .catch(err =>{
            if (!err.statusCode) {
                console.log(err);
                err.statusCode = 500;
            }
            next(err);
        });
}

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
                }
                next(err);
            });
    });

}