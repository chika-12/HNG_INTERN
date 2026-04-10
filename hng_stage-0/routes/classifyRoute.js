const express = require('express');
const classifyRouter = express.Router();
const classifyController = require('../controllers/classifyController');

classifyRouter.post('/classify', classifyController.classifyController);

module.exports = classifyRouter;