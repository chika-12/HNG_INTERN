const express = require('express');
const authRouter = express.Router();
const authController = require('../controllers/authController');

authRouter.get('/github', authController.redirectFunction);
authRouter.get('/github/callback', authController.githubCallbackHandler);
authRouter.post('/refresh', authController.refreshToken);
authRouter.post('/logout', authController.logout);
module.exports = authRouter;
