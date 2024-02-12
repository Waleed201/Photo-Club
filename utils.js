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


function compressImage(file) {
  return new Promise(resolve => {
      const reader = new FileReader();

      reader.onload = function(event) {
          const img = new Image();
          img.onload = function() {
              const maxWidth = 800;
              const maxHeight = 600;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                  if (width > maxWidth) {
                      height *= maxWidth / width;
                      width = maxWidth;
                  }
              } else {
                  if (height > maxHeight) {
                      width *= maxHeight / height;
                      height = maxHeight;
                  }
              }

              canvas.width = width;
              canvas.height = height;

              ctx.clearRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);

              canvas.toBlob(blob => {
                  resolve(blob);
              }, 'image/jpeg', 0.7); // Adjust compression quality here (0.7 means 70% quality)
          };
          img.src = event.target.result;
      };

      reader.readAsDataURL(file);
  });
}




module.exports = {
  initializePassport,
  checkAuthenticated,
  checkNotAuthenticatedTest,
  checkNotAuthenticated,
  // upload,
  compressImage
};
        