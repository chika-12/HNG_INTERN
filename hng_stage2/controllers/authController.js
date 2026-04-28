const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/user');
const generatePKCE = require('../utils/pkce');
const crypto = require('crypto');
const axios = require('axios');
const github_access_url = 'https://github.com/login/oauth/access_token';
const getGitHubUser = 'https://api.github.com/user';
const generateTokens = require('../utils/generateToken');
const jwt = require('jsonwebtoken');

exports.redirectFunction = catchAsync(async (req, res, next) => {
  const state = crypto.randomBytes(16).toString('hex');
  const { codeVerifier, codeChallenge } = generatePKCE();
  const source = req.query.source || 'web';

  res.cookie('code_verifier', codeVerifier, {
    httpOnly: true,
    maxAge: 60000,
    sameSite: 'lax',
    secure: false,
  });
  res.cookie('oauth_state', state, {
    httpOnly: true,
    maxAge: 60000,
    sameSite: 'lax',
    secure: false,
  });
  res.cookie('oauth_source', source, {
    httpOnly: true,
    maxAge: 60000,
    sameSite: 'lax',
    secure: false,
  });

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_CALLBACK_URL,
    state: state,
    scope: 'read:user user:email',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

exports.githubCallbackHandler = catchAsync(async (req, res, next) => {
  const { code, state } = req.query;
  const storedState = req.cookies.oauth_state;
  const code_verifier = req.cookies.code_verifier;
  const source = req.cookies.oauth_source;

  if (storedState != state) {
    return next(new AppError('Invalid state parameter', 401));
  }

  const responseFromGit = await axios.post(
    github_access_url,
    {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: process.env.GITHUB_CALLBACK_URL,
      code_verifier,
    },
    { headers: { Accept: 'application/json' } }
  );
  const githubAccessToken = responseFromGit.data.access_token;
  const userCredentils = await axios.get(getGitHubUser, {
    headers: { Authorization: `Bearer ${githubAccessToken}` },
  });
  const { id: githubId, login: username } = userCredentils.data;
  let { email } = userCredentils.data;

  if (!email) {
    const emailRes = await axios.get('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${githubAccessToken}` },
    });
    const primary = emailRes.data.find((e) => e.primary && e.verified);
    email = primary ? primary.email : null;
  }

  const user = await User.findOneAndUpdate(
    { githubId },
    {
      username,
      githubId,
      email,
    },
    { upsert: true, new: true }
  );
  const refreshToken = generateTokens.generateRefreshToken(user._id);
  const accessToken = generateTokens.generateAccessToken(user._id, user.role);
  user.refreshToken = refreshToken;
  await user.save();
  console.log('REFRESH TOKEN:', refreshToken);

  if (source === 'cli') {
    return res.redirect(
      `http://localhost:4242/?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  }else {
    res.cookie('access_token', accessToken, { httpOnly: true });
    res.cookie('refresh_token', refreshToken, { httpOnly: true });
    res.redirect(process.env.WEB_PORTAL_URL);
  }
});

exports.refreshToken = catchAsync(async (req, res, next) => {
  const refreshToken = req.body.refreshToken;
  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== refreshToken) {
    return next(new AppError('Invalid refresh token', 403));
  }
  const access_token = generateTokens.generateAccessToken(user._id, user.role);
  return res.status(200).json({ access_token });
});

exports.logout = catchAsync(async (req, res, next) => {
  const refreshToken = req.body.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    return next(new AppError('Invalid refesh token', 403));
  }
  user.refreshToken = null;
  await user.save();
  return res.status(200).json({
    status: 'success',
  });
});
