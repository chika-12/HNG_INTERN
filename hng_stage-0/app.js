const express = require('express');
const classifyRoute = require('./routes/classifyRoute');


const app = express();
app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});
app.use('/api', classifyRoute);
module.exports = app;