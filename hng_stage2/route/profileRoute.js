const express = require('express');
const profileRoute = express.Router();
const controllers = require('../controllers/profileControllers');
const {
  protectMiddleWare,
  requireRole,
} = require('../middleWare/protectMiddleWare');

profileRoute.use(protectMiddleWare);
profileRoute.get('/profiles/search', controllers.searchProfiles);
profileRoute
  .route('/profiles')
  .get(controllers.getProfiles)
  .post(requireRole(['admin']), controllers.createProfiles);
profileRoute
  .route('/profiles/:id')
  .get(controllers.getProfilesById)
  .delete(requireRole(['admin']), controllers.deleteProfileById);

module.exports = profileRoute;
