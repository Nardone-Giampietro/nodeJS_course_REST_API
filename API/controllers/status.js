const User = require('../model/user');
const {validationResult} = require("express-validator");

exports.getStatus = (req, res, next) => {
    const userId = req.userId;
    return User.findById(userId)
        .lean()
        .then(user => {
            if(!user){
                const error = new Error("User not found");
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({message: "User found", status: user.status});
        })
        .catch(err => {
            if (!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.putStatus = (req, res, next) => {
    const newStatus = req.body.status;
    const userId = req.userId;
    const result = validationResult(req);
    if (!result.isEmpty()){
        const error = new Error("Validation failed, entered status is incorrect.");
        error.statusCode = 422;
        throw error;
    }
    return User.findById(userId)
        .then(user =>{
            if(!user){
                const error = new Error("User not found");
                error.statusCode = 404;
                throw error;
            }
            user.status = newStatus;
            return user.save()
        })
        .then(result => {
            res.status(201).json({message:"Status updated.", status: result.status});
        })
        .catch(err => {
            if (!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        })
}