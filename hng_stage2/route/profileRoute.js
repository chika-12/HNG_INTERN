const express = require('express');
const profileRoute = express.Router();
const controllers = require('../controllers/profileControllers');
const {
  protectMiddleWare,
  requireRole,
} = require('../middleWare/protectMiddleWare');

//profileRoute.use(protectMiddleWare);
profileRoute.get(
  '/profiles/search',
  protectMiddleWare,
  controllers.searchProfiles
);
profileRoute
  .route('/profiles')
  .get(protectMiddleWare, controllers.getProfiles)
  .post(protectMiddleWare, requireRole(['admin']), controllers.createProfiles);

profileRoute.get(
  '/profiles/export',
  protectMiddleWare,
  requireRole(['admin']),
  controllers.exportProfiles
);

profileRoute
  .route('/profiles/:id')
  .get(protectMiddleWare, controllers.getProfilesById)
  .delete(
    protectMiddleWare,
    requireRole(['admin']),
    controllers.deleteProfileById
  );

module.exports = profileRoute;
