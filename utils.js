const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const multer = require('multer');
const AWS = require('aws-sdk');

// Multer Configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Passport Configuration
function initializePassport(passport, getUserByEmail, getUserById) {
  passport.use(new LocalStrategy({ usernameField: 'email' },
    async (email, password, done) => {
      const user = await getUserByEmail(email);
      if (user == null) {
        return done(null, false, { message: 'No user with that email' });
      }
      try {
        if (await bcrypt.compare(password, user.password)) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Password incorrect' });
        }
      } catch (e) {
        return done(e);
      }
    }
  ));

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    getUserById(id)
      .then(user => done(null, user))
      .catch(err => done(err));
  });}

// Authentication Middleware
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}


function checkNotAuthenticatedTest(req, res, next) {
  if (req.isAuthenticated() && req.user.role != "admin" ) {
    return res.redirect('/');
  }
  next();
}


function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
}



module.exports = {
  initializePassport,
  checkAuthenticated,
  checkNotAuthenticatedTest,
  checkNotAuthenticated,
  upload
};
        