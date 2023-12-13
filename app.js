if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');

const initializePassport = require('./passport-config');
const users = []; // Users array should be defined before calling initializePassport

initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
);

const app = express();
app.set('view engine', 'ejs'); // Corrected 'view-engine' to 'view engine'


// Static files middleware
app.use(express.static('./SWE363 Project/css'));
app.use(express.static('./SWE363 Project/fonts'));
app.use(express.static('./SWE363 Project/js')); // Changed 'JS' to 'js' for consistency
app.use(express.static('./SWE363 Project/images'));

// Commented out the HTML directory to prevent serving static HTML files
// app.use(express.static('./SWE363 Project/html'));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
// app.get('/', (req, res) => {
//   res.sendFile(path.resolve(__dirname, './views/index.ejs'));
// });

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register');
});

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    });
    res.redirect('/login');
  } catch {
    res.redirect('/register');
  }
});

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login');
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

const fs = require('fs');

let covrg = {
  ceremonyTitle: "Ceremony honoring club presidents",
  details: "Short course in portrait photography by Mr. Mohammad Shabeb Don't miss this chance Note: \"your attend count with non academic activities\"",
  photos: [
    "https://lh3.googleusercontent.com/fife/AGXqzDnnPT8rp3D2B_ZpmI4LuyFnNsS_JpZ1Q1XEVsNMUK5hSn5BEELIHkiv9itleiE_wK_8UjwEDoiE69kf89J4N8dTBtDNNHSQCMUGH-8El8O_p1xjozu0r8shymerZmXDUsmcGmef4X3plkAwF6Bjm6uQk5_rToaGSi631_jC-W0aAfyPMK2T1mGf25J6ks6tupR62C_bG7wwCSN-_HTLD-DJxQ42JrZ9iuMm6Fx-iFNIFnSlhrCQ994iDtWQ3wJxvgmNPs8ICwccYsreRxwCn9JICSXzhp-zcdl2_QB52Bq-M6bqgGbgi2XCXzWvnfy35lxGERPzIta6VLpqN83OW27UySJlbPTZkT12AwU4YSYPRvqs17PtpYxg3CCgp_XH2dYlLbko5523tKdS19Sw9hjmGw8E0R1WtRrLJFV7tGGrtMMHZwBKTqeXTmFUt3p9-B2DvUbvdbMMLQYw7OLdMBQRu2UNQVoIRITtv1BhAaWOCvSFF_m5UC1QLVqB0cSX4Bxk_JaFTD3tedHypYAkbZuCnAACDuyW3HoNhTwbqutTKAVZoBWpuBwHo4g_rKmO4kOSkC8O2XBsMvIxADFcrHbnjtDuDajFhCqY3zrwtpHxYUTKh5FNQKpYSyqlrR-vEUeciYjcRju3xUdieT0E2oaoFtJLan_57zMfAiAJBJ2ZxQTEhwNRlGNSDxqfjRvecoWqx5fDtSacGlFRprCS23VWBHIGP1smCn_4KQjbVNooJy1aMiO40TYHSsxFhKb1ECkVQkptcjXdfSBlVFskiK-tFTzweP4-grEu92mcXvWifQAF5VxcirSQAMel5tgxtjaUie7Xhvx9PBQN0phEJQCEoJQJxUUR7c56VP23xTFnObARU-AAqj_74_RQO2M2I8JTEEekcZqWZehyzrHlZxVjcGGoew_5Lm7r4n-T8rlBL7w=w1194-h1470",
    "https://lh3.googleusercontent.com/fife/AGXqzDmT87diGBY96akkAyQxKrN0YeY1nemEXD5zI1Ji6wNHMYdN7OHbMFT3GM5kA_A1_-fALwCbG3jogjboXwuiPcOVyNPsNBbhA39t_Km8CmRJJ45SjpDuBa6vSIyjCWVQFT2W-DPm31zOZD4-XPXdiMSxP-0yVs6zpAMjj2I6E0A7O2YF9ozj1NSXkiAc66rRh36irggFrbTixbQPgPgEvhhNM9o0M5JJSQ3BDq2dqiIHm9KAxPQZIB9A3MIhppuXHr8Dz2nZIkutmtA8asevlJPufirImVLlsRqh2nKWKzcrTHN6L7lfir_2kK4ov96FUsct8viI8o4V0dRSM0XTbcm34OZWi8V83HDx16e3J3bD5UpW4icyuB8w1TtUi57ZjcXGQ08T3hFl2bEO8L-pQkbfrJeyG4A3Oq_xC4s4IL6NtnYlDvzRX12941-aD2SjRv4_7MkA4OdCriNXOi0LeZf364TltBYiGXAtwwCuKqgm9wFMs9taQ3KRpktGEkB9rG9n9eaAX0HPxCWQneS8o66akN1td3wZ_YXebBpZObm1SXo182dbGVNGJCVQ3uR6rCm3HhIsjksYXeHBAeMg0aAQ4Ognx7dcmfHfhY_B60vR7t1_fqi7IpaansBgmBdemm5LZC2x3EnE2vdDNIKKecKZT0xg9eEtV9NSFfivhE4mIkTJ_AcAcZsUs6tXu-POsuo5VRSS-6Rnpp-cDjhlrkMLEckkxwOKxt5XPSQpH90Qti83gXjdLMQzcZBTioeg-kyUKoAksf1CX04RmaKJGa1k86Hfu2Ov5-2EKk_Hr-pL2XuuNmNdShSsSzHC_aM0BQUgHvOda5byfHaoh4ZHFcbNmzODADQUswgVbydbuwP6RdICGJ-v4vNK8FHBGUYvbupwJHlDVJYbTgeHmYNKPuMmk8fDE9OQQlBWpwVpf2-G-dA=w1194-h1470"
  ]
};

// Function to encode file data to base64 encoded string
function base64_encode(file) {
  const fullPath = path.join(__dirname, file);
  const bitmap = fs.readFileSync(fullPath);
  return Buffer.from(bitmap).toString('base64');
}

// Adding base64 encoded images to the object

app.get('/covrege', (req, res) => {
  res.render('covrege', { covrg })
})

app.get('/covreges', (req,res) => {
  res.render('covreges')
})

app.all('*', (req, res) => {
  res.status(404).send('Resource not found');
});

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.listen(3000, () => {
  console.log('Server is listening on port http://localhost:3000 ...');
});
