const express = require("express")
const profileRoute = express.Router()
const controllers = require("../controllers/profileControllers")

profileRoute.route('/profiles').get(controllers.getProfiles).post(controllers.createProfiles)
profileRoute.route('/profiles/:id').get(controllers.getProfilesById).delete(controllers.deleteProfileById)

module.exports = profileRoute