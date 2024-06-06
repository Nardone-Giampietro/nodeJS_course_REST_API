const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const feedRoutes = require('./routes/feed');
const app = express();

app.use(express.json());
app.use((req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,PATCH,DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

app.use("/feed", feedRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
})