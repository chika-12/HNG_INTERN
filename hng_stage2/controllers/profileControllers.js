const Profile = require('../models/usermodel');
const externalFunctions = require('../service/external_services/external_api_functions');
const catchAsync = require('../utils/catchAsync');
const { v7: uuidv7 } = require('uuid');
const queryBuilder = require('../queryFeatures/features.js');
const validateQuery = require('../queryFeatures/validateQuery.js');
const parseSearchQuery = require('../queryFeatures/searchParser.js');
const AppError = require('../utils/appError.js');

//Get all profiles and accepts query params
exports.getProfiles = catchAsync(async (req, res, next) => {
  const { filter, sortBy, page, limit, skip } = queryBuilder(req.query);
  validateQuery(req.query);

  const [profiles, total] = await Promise.all([
    Profile.find(filter).sort(sortBy).skip(skip).limit(limit),
    Profile.countDocuments(filter),
  ]);
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    status: 'success',
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    data: profiles,
  });
});

//Create profile
exports.createProfiles = catchAsync(async (req, res, next) => {
  const requestedName = req.body.name;
  const id = uuidv7();

  if (!requestedName || typeof requestedName !== 'string') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid name provided',
    });
  }
  const name = requestedName.toLowerCase().trim();

  // Idempotency check
  const existing = await Profile.findOne({ name: name });

  if (existing) {
    return res.status(200).json({
      status: 'success',
      message: 'Profile already exists',
      data: existing,
    });
  }

  //request to gendarize
  const external_api_gender = await externalFunctions.genderise(name);
  const { gender, probability, count } = external_api_gender;

  if (!gender || probability === undefined || count === 0) {
    return res.status(502).json({
      status: '502',
      message: 'Genderize returned an invalid response',
    });
  }

  const sample_size = count;
  const gender_probability = probability;

  // Extract age from Agify. Classify age_group: 0–12 → child, 13–19 → teenager, 20–59 → adult, 60+ → senior
  const external_api_agify = await externalFunctions.agify(name);
  const { age } = external_api_agify;

  if (age === null) {
    return res.status(502).json({
      status: '502',
      message: 'Agify returned an invalid response',
    });
  }

  // working on age_group conditionals
  let age_group;
  if (age >= 0 && age <= 12) {
    age_group = 'child';
  } else if (age >= 13 && age <= 19) {
    age_group = 'teenager';
  } else if (age >= 20 && age <= 59) {
    age_group = 'adult';
  } else {
    age_group = 'senior';
  }

  //Extract country list from Nationalize. Pick the country with the highest probability as country_id

  const external_api_nationalize = await externalFunctions.nationalize(name);
  const { country } = external_api_nationalize;

  if (!country || country.length === 0) {
    return res.status(502).json({
      status: '502',
      message: 'Nationalize returned an invalid response',
    });
  }

  const topCountry = country.reduce((max, current) =>
    current.probability > max.probability ? current : max
  );

  const country_id = topCountry.country_id;
  const country_probability = topCountry.probability;

  const profile = await Profile.create({
    id,
    name: name,
    gender,
    gender_probability,
    sample_size,
    age,
    age_group,
    country_id,
    country_probability,
  });
  return res.status(201).json({
    status: 'success',
    data: profile,
  });
});

//Get profile by Id

exports.getProfilesById = catchAsync(async (req, res, next) => {
  const id = req.params.id?.trim();

  if (!id) {
    return res.status(400).json({
      status: 'error',
      message: 'ID is required',
    });
  }

  const profile = await Profile.findOne({ id }).select('-_id');
  if (!profile) {
    return res.status(404).json({
      status: 'error',
      message: 'Profile not found',
    });
  }

  return res.status(200).json({
    status: 'success',
    data: profile,
  });
});

//Delete profile by id
exports.deleteProfileById = catchAsync(async (req, res, next) => {
  const id = req.params.id?.trim();

  if (!id) {
    return res.status(400).json({
      status: 'error',
      message: 'ID is required',
    });
  }

  const deleted = await Profile.findOneAndDelete({ id });

  if (!deleted) {
    return res.status(404).json({
      status: 'error',
      message: 'Profile not found',
    });
  }
  return res.status(204).send();
});

exports.searchProfiles = catchAsync(async (req, res, next) => {
  const { q, page, limit } = req.query;

  if (!q || !q.trim()) {
    return next(new AppError('Query parameter "q" is required', 400));
  }

  const parsedFilter = parseSearchQuery(q);

  if (!parsedFilter) {
    return res.status(400).json({
      status: 'error',
      message: 'Unable to interpret query',
    });
  }

  // Build the Mongoose filter from parsed result
  const mongoFilter = {};

  if (parsedFilter.gender) mongoFilter.gender = parsedFilter.gender;
  if (parsedFilter.age_group) mongoFilter.age_group = parsedFilter.age_group;
  if (parsedFilter.country_id) mongoFilter.country_id = parsedFilter.country_id;
  if (parsedFilter.min_age || parsedFilter.max_age) {
    mongoFilter.age = {};
    if (parsedFilter.min_age) mongoFilter.age.$gte = parsedFilter.min_age;
    if (parsedFilter.max_age) mongoFilter.age.$lte = parsedFilter.max_age;
  }

  const pg = Math.max(1, Number(page) || 1);
  const lim = Math.min(50, Math.max(1, Number(limit) || 10));
  const skip = (pg - 1) * lim;

  //const { filter, sortBy, page, limit, skip } = queryBuilder(mongoFilter);
  const [profiles, total] = await Promise.all([
    Profile.find(mongoFilter).sort('-created_at').skip(skip).limit(lim).lean(),
    Profile.countDocuments(mongoFilter),
  ]);

  const totalPages = Math.ceil(total / lim);

  return res.status(200).json({
    status: 'success',
    query: q,
    interpreted: parsedFilter, // helps with debugging
    total,
    page: page,
    limit: limit,
    totalPages,
    hasNextPage: pg < totalPages,
    hasPrevPage: pg > 1,
    data: profiles,
  });
});
