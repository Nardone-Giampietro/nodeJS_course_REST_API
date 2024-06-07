const express = require('express');
const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const mongoose = require('mongoose');
const multer = require('multer');
const app = express();

const fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "images");
    },
    filename: (req, file, cb) => {
        const fileNameRandom = crypto.randomBytes(16).toString('hex');
        const fileNameFull = fileNameRandom + "_" + file.originalname;
        cb(null, fileNameFull);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,PATCH,DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

app.use(multer({
    storage: fileStorage,
    fileFilter: fileFilter,
}).single("image"));

app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

app.use((err, req, res, next) => {
    console.log(err);
    const statusCode = err.statusCode;
    const message = err.message;
    const data = err.data;
    res.status(statusCode).json({message: message, data: data});
});

mongoose.connect(process.env.DATABASE_KEY)
    .then(result => {
        app.listen(process.env.PORT, () => {
            console.log(`Listening on port ${process.env.PORT}`);
        })
    })
    .catch(error => {
        console.error(error);
    });
