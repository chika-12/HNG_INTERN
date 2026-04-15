const express = require("express")
const mongodb_sanitizer = require("express-mongo-sanitize")
const hpp = require("hpp")
const helmet = require("helmet")
const rate_limiter = require("express-rate-limit")
//const cors = require("cors")
const xss = require("xss-clean")
const profileRoute = require("./route/profileRoute")
const app = express()

app.use(helmet())
app.use(xss())
app.use(hpp())
app.use(mongodb_sanitizer())

app.use(express.json({limit: '10kb'}))

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

const limit = rate_limiter({
    max:100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP. Try again later.'
})

app.use('/api', limit);

//Testing route

app.get('/', (req, res) => {
  res.json({ message: 'DayTrack API is running' })
})
app.use('/api', profileRoute)


module.exports = app