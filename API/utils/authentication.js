const jwt = require('jsonwebtoken');
const {JsonWebTokenError} = require("jsonwebtoken");

exports.createJWToken = (user) => {
    const data = {
        id : user._id.toString(),
        email : user.email,
    };
    return jwt.sign(data, process.env.JWT_SECRET_KEY, {expiresIn: process.env.JWT_EXPIRES});
};

exports.isAuth = (req, res, next) => {
    const header = req.get('Authorization');
    if (!header){
        const error = new Error("Not authenticated");
        error.status = 401;
        throw error;
    }
    const token = header.split(" ")[1];
    if (!token){
        const error = new Error("No Token Provided.");
        error.statusCode = 400;
        throw error;
    }
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.userId = decodedToken.id;
        req.email = decodedToken.email;
        return next();
    } catch (err) {
        if (err instanceof JsonWebTokenError) {
            const error = new Error("Not authenticated.");
            error.statusCode = 401;
            next(error);
        }
        err.statusCode = 500;
        next(err);
    }
};