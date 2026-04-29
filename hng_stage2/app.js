const express = require('express');
const mongodb_sanitizer = require('express-mongo-sanitize');
const hpp = require('hpp');
const helmet = require('helmet');
const rate_limiter = require('express-rate-limit');
const cors = require('cors');
const xss = require('xss-clean');
const profileRoute = require('./route/profileRoute');
const app = express();
const cookieParser = require('cookie-parser');
const globalErrorHandler = require('./middleWare/globalErrorHandler');
const authRouter = require('./route/authRoute');

app.use(helmet());
app.use(xss());
app.use(hpp());
app.use(mongodb_sanitizer());

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   if (req.method === 'OPTIONS') {
//     return res.sendStatus(200);
//   }
//   next();
// });

app.use(
  cors({
    origin: [
      'http://localhost:5500',
      'https://insighta-web-portal-eta.vercel.app',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

const limit = rate_limiter({
  max: 500, // raise this
  windowMs: 60 * 60 * 1000,
  message: JSON.stringify({
    // make it JSON!
    status: 'error',
    message: 'Too many requests from this IP. Try again later.',
  }),
});

app.use('/api', limit);
app.use('/api/v1', profileRoute);
app.use('/api/v1/auth', authRouter);
app.use(globalErrorHandler);

module.exports = app;
