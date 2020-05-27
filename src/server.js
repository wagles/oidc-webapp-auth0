const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const express = require('express');
const handlebars = require('express-handlebars');
const path = require('path');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2');
const request = require('request-promise');
const session = require('express-session');
const jwt = require('jsonwebtoken');

// loading env vars from .env file
require('dotenv').config();

const app = express();

//Configure Passport to use OAuth2Strategy
const oAuth2Strategy = new OAuth2Strategy(
  {
    state: true,
    authorizationURL: process.env.AUTHORIZATION_URL,
    tokenURL: process.env.TOKEN_URL,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: 'http://ip-10-119-0-167:3000/callback',
    passReqToCallback: true
  },
  (accessToken, refreshToken, extraParams, profile, done) => {
    profile.idToken = extraParams.id_token;
    console.log(profile);
    console.log(extraParams.id_token);
    return done(null, profile);
  }
);
passport.use(oAuth2Strategy);
//

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(crypto.randomBytes(16).toString('hex')));
app.use(
  session({
    secret: crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false
  })
);
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/profile', (req, res) => {
  const { user } = req.session.passport;
  res.render('profile', {
    idToken: user.idToken,
    decodedIdToken: user._json
  });
});

//  app.get('/login', (req, res) => {
//    res.status(501).send();
// });

app.get(
  '/login',
  passport.authenticate('oauth2', {
    scope: 'openid email profile'
  })
);

//app.post('/callback', async (req, res) => {
//  res.status(501).send();
//});

app.get('/callback', (req, res, next) => {
  passport.authenticate('oauth2', (err, user) => {
    if (err) return next(err);
    if (!user) return res.redirect('/login');
    req.logIn(user, function(err) {
      if (err) return next(err);
      res.redirect('/profile');
    });
  })(req, res, next);
});

app.get('/to-dos', async (req, res) => {
  res.status(501).send();
});

app.get('/remove-to-do/:id', async (req, res) => {
  res.status(501).send();
});

app.listen(3000, () => {
  console.log(`Server running on http://localhost:3000`);
});
