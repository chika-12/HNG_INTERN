const Profile = require('../models/usermodel')
const externalFunctions = require("../service/external_services/external_api_functions")
const catchAsync = require("../utils/catchAsync")
const { v7: uuidv7 } = require("uuid");


//Get all profiles and accepts query params
exports.getProfiles = catchAsync(async(req, res, next)=>{
   
    const { gender, country_id, age_group } = req.query
    const filter = {}

    const allowedGenders = ["male", "female"]
    if (gender && !allowedGenders.includes(gender.toLowerCase())) {
        return res.status(400).json({
            status: "error",
            message: "Invalid gender filter",
        });
    }

    if (gender){
        filter.gender = gender.toLowerCase().trim();
    }
    if (country_id){
        filter.country_id = country_id.toUpperCase().trim();
    }
    if (age_group){
        filter.age_group = age_group.toLowerCase().trim()
    }
    const profiles = await Profile.find(filter).sort({created_at: -1})
    
    return res.status(200).json({
        status: "success",
        count: profiles.length,
        data: profiles,
    });
})

//Create profile
exports.createProfiles = catchAsync(async(req, res, next)=>{
    const requestedName = req.body.name
    const id = uuidv7()

    if (!requestedName || typeof requestedName !== "string") {
        return res.status(400).json({
            status: "error",
            message: "Invalid name provided",
        });
    }
    const name = requestedName.toLowerCase().trim()

    // Idempotency check
    const existing = await Profile.findOne({ name: name });

    if (existing) {
        return res.status(200).json({
            status: "success",
            message: "Profile already exists",
            data: existing,
        });
    }

    //request to gendarize
    const external_api_gender = await externalFunctions.genderise(name)
    const {gender, probability, count} = external_api_gender

    if (!gender || probability === undefined || count === 0) {
        return res.status(502).json({
            status: "502",
            message: "Genderize returned an invalid response",
        });
    }

    const sample_size = count;
    const gender_probability = probability

    // Extract age from Agify. Classify age_group: 0–12 → child, 13–19 → teenager, 20–59 → adult, 60+ → senior
    const external_api_agify = await externalFunctions.agify(name)
    const {age} = external_api_agify

    if (age === null) {
        return res.status(502).json({
            status: "502",
            message: "Agify returned an invalid response",
        });
    }

    // working on age_group conditionals
    let age_group;
    if (age >= 0 && age<= 12){
        age_group = 'child'
    }
    else if(age >= 13 && age <= 19){
        age_group = 'teenager';
    }
    else if (age >= 20 && age <= 59){
        age_group = 'adult';
    }
    else{
        age_group = 'senior'
    }

    //Extract country list from Nationalize. Pick the country with the highest probability as country_id

    const external_api_nationalize = await externalFunctions.nationalize(name)
    const {country} = external_api_nationalize

    if (!country || country.length === 0) {
        return res.status(502).json({
            status: "502",
            message: "Nationalize returned an invalid response",
        });
    }
    
    const topCountry = country.reduce((max, current) =>
        current.probability > max.probability ? current : max
    );
    
    const country_id = topCountry.country_id;
    const country_probability = topCountry.probability;

    const profile = await Profile.create({
        id,
        name:name,
        gender,
        gender_probability,
        sample_size,
        age,
        age_group,
        country_id,
        country_probability,
    });
    return res.status(201).json({
        status: "success",
        data:profile
    })
})

//Get profile by Id

exports.getProfilesById = catchAsync(async(req, res, next)=>{
    const id = req.params.id?.trim();

    if (!id) {
        return res.status(400).json({
            status: "error",
            message: "ID is required",
        });
    }

    const profile = await Profile.findOne({ id }).select("-_id");
    if (!profile){
        return res.status(404).json({
            status: "error",
            message: "Profile not found",
        })
    }

    return res.status(200).json({
        status: "success",
        data: profile
    })

})

//Delete profile by id
exports.deleteProfileById = catchAsync(async(req, res, next)=>{
    const id = req.params.id?.trim()

    if (!id) {
        return res.status(400).json({
            status: "error",
            message: "ID is required",
        });
    }

    const deleted = await Profile.findOneAndDelete({id})

    if (!deleted) {
        return res.status(404).json({
            status: "error",
            message: "Profile not found",
        });
    }
    return res.status(204).send();
})
