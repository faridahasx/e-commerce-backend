const dotenv = require('dotenv');
const passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const CryptoJS = require('crypto-js');
const User = require('../models/User');
const Address = require('../models/Address');

dotenv.config({path: './config/config.env'});

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const PASSWORD = process.env.SOCIAL_PASSWORD;
const PASSWORD_SECRET = process.env.PASSWORD_SECRET;
const BASE_URL = process.env.BASE_URL;

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${BASE_URL}/api/auth/google/callback`
  },
  async function(accessToken, refreshToken, profile, cb) {
    const email = profile.emails[0]['value'];    
    const user = await User.findOne({email:email});
    if (!user) {
      const newUser = new User({
          email: email,
          password: CryptoJS.AES.encrypt(PASSWORD, PASSWORD_SECRET).toString(),
      });      
      await newUser.save();
      const newUserAddress  = new Address({
        userID: newUser._id
      });
      await newUserAddress.save();
      return cb(null, newUser);
  };
  return cb(null, user);
}));

