const User = require('../model/user');
const {validationResult} = require("express-validator");

exports.getStatus = async (req, res, next) => {
    const userId = req.userId;
    try {
        const user = await User.findById(userId).lean().exec();
        if(!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            return next(error);
        }
        res.status(200).json({message: "User found", status: user.status});
    } catch (err) {
        if (!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.putStatus = async (req, res, next) => {
    const newStatus = req.body.status;
    const userId = req.userId;
    const result = validationResult(req);
    if (!result.isEmpty()){
        const error = new Error("Validation failed, entered status is incorrect.");
        error.statusCode = 422;
        return next(error);
    }

    try{
        const user = await User.findById(userId);
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            return next(error);
        }
        user.status = newStatus;
        const newUser = await user.save();
        res.status(201).json({message:"Status updated.", status: newUser.status});
    }
    catch(err){
        if (!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}