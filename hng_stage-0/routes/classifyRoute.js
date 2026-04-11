const express = require('express');
const classifyRouter = express.Router();
const classifyController = require('../controllers/classifyController');

classifyRouter.get('/classify', classifyController.classifyController);

module.exports = classifyRouter;