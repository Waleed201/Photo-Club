if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const initializePassport = require('./passport-config');
const { createS3Instance, BUCKETNAME } = require('./aws-s3'); // Import the functions and objects from aws-s3.js



const users = []; // Users array should be defined before calling initializePassport

async function eee(str) {
  const a = await bcrypt.hash(str, 10);
  return a;
}
 
(async () => {
  var hashedPassword = await eee("admin");

  users.push({
    id: Date.now().toString(),
    name: "admin",
    email: "admin@a",
    password: hashedPassword,
    role: 'admin'
  })
  
   hashedPassword = await eee("member");
  users.push({
    id: Date.now().toString(),
    name: "admin",
    email: "member@a",
    password: hashedPassword,
    role: 'member'
  })
  
  hashedPassword = await eee("club");
  users.push({
    id: Date.now().toString(),
    name: "admin",
    email: "club@a",
    password: hashedPassword,
    role: 'club'
  })
  
  hashedPassword = await eee("user");
  users.push({
    id: Date.now().toString(),
    name: "admin",
    email: "user@admin",
    password: hashedPassword,
    role: 'user'
  });

  // Rest of your code...
})();

const getUserByEmail = (email) => {
  return users.find((user) => user.email === email);
};

const getUserById = (id) => {
  return users.find(user => user.id === id);
};


initializePassport(
  passport,
  getUserByEmail,
  getUserById
);

const app = express();
app.set('view engine', 'ejs'); // Corrected 'view-engine' to 'view engine'


// Static files middleware
app.use(express.static('./SWE363 Project/css'));
app.use(express.static('./SWE363 Project/fonts'));
app.use(express.static('./SWE363 Project/js')); // Changed 'JS' to 'js' for consistency
app.use(express.static('./SWE363 Project/images'));
app.use(express.static('./aws-s3')); // Added this line to serve static files from the 'aws-s3' directory
app.use(methodOverride('_method'));



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

app.get('/index1', (req, res) => {
  console.log("index111")
  res.render('index1');
});


app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register');
});



app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const email = req.body.email;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Check if the user already exists
    const user = getUserByEmail(email);

    if (user) {
      // User with this email already exists
      req.flash('error', 'Email already exists');
      return res.status(400).render('register', { messages: req.flash() });
      res.redirect('/login'); 
    }

    // If user is null, add the new user
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: email,
      password: hashedPassword,
      role: 'user'
    });
    res.redirect('/login'); // Redirect to login page after successful registration
  } catch (error) {
    console.error(error);
    res.redirect('/register');
  }
  console.log(users);
});

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login');
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

app.post('/logout', function(req, res, next){
  console.log('Logout route hit');
  req.logout(function(err) {
    if (err) {
      console.error('Logout error:', err);
      return next(err);
    }
    console.log('Logout successful');
    res.redirect('/');
  });
});



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

// app.get('/covrege', (req, res) => {
//   const s3 = new AWS.S3(); // Create a new S3 instance
//     const listParams = { Bucket: BUCKETNAME }; // Define parameters for listing objects in S3 bucket
//     s3.listObjectsV2(listParams, (err, data) => { // List objects in the specified bucket
//         if (err) {
//             console.log(err); // Log any errors to the console
//             res.status(500).send("Internal Server Error"); // Send a 500 error response on failure
//         } else {
//             // Map S3 file data to a more user-friendly format
//             const files = data.Contents.map(file => ({
//                 name: file.Key, // File name
//                 url: `https://${BUCKETNAME}.s3.amazonaws.com/${file.Key}` // File URL
//             }));
//   res.render('covrege', { files , covrg })
//         }
//     }
//     )
// });

app.get('/covrege', (req, res) => {
  const s3 = createS3Instance(); // Use the createS3Instance function from aws-s3.js
  const listParams = { Bucket: BUCKETNAME };
  s3.listObjectsV2(listParams, (err, data) => {
      if (err) {
          console.log(err);
          res.status(500).send("Internal Server Error");
      } else {
          const files = data.Contents.map(file => ({
              name: file.Key,
              url: `https://${BUCKETNAME}.s3.amazonaws.com/${file.Key}`
          }));
          res.render('covrege', { files , covrg });
      }
  });
});

app.get('/covreges',  (req, res) => {
  isAuthenticated = req.isAuthenticated()
  console.log(isAuthenticated)
  if (isAuthenticated){
    res.render('covreges', { userRole: req.user.role });
  }else {
    res.render('covreges', { userRole: "vistor" });
  }
});

app.get('/events', (req,res) => {
  res.render('events')
})

app.all('*', (req, res) => {
  res.status(404).send('Resource not found');
});

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
