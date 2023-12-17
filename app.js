// Import necessary modules
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const multer = require('multer');
const AWS = require('aws-sdk');
const initializePassport = require('./passport-config');
const axios = require('axios');


const app = express();

// Configure AWS S3
AWS.config.update({
  accessKeyId: 'AKIAYGINPQ2H42KMVZM3',
  secretAccessKey: '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',
  region: 'eu-north-1'
});

const BUCKETNAME = 'photo-club-s3'; // Define the S3 bucket name
const s3 = new AWS.S3();
function createS3Instance() {
  return new AWS.S3();
}

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// User array and other initializations
const users = [];

// Define your helper functions like eee, getUserByEmail, etc.
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
      name: "member",
      email: "member@a",
      password: hashedPassword,
      role: 'member'
    })
    
    hashedPassword = await eee("club");
    users.push({
      id: Date.now().toString(),
      name: "club",
      email: "club@a",
      password: hashedPassword,
      role: 'club'
    })
    
    hashedPassword = await eee("user");
    users.push({
      id: Date.now().toString(),
      name: "user",
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
  
initializePassport(passport, getUserByEmail, getUserById);

// Express app configuration
app.set('view engine', 'ejs');
app.use(express.static('path_to_static_files')); // Adjust the path
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

// Define your routes
app.use(express.static('./SWE363 Project/css'));
app.use(express.static('./SWE363 Project/fonts'));
app.use(express.static('./SWE363 Project/js')); // Changed 'JS' to 'js' for consistency
app.use(express.static('./SWE363 Project/images'));
app.use(express.static('./Face_recognition/your_script.by'))
app.use(methodOverride('_method'));
app.use(express.json());

function checkNotAuthenticatedTest(req, res, next) {
  if (req.isAuthenticated() && req.user.role != "admin" ) {
    return res.redirect('/');
  }
  next();
}


// Route definitions
app.get('/', (req, res) => {
  const isAuthenticated = req.isAuthenticated();
  if (isAuthenticated){
    res.render('index1', { userRole: req.user.role, userName: req.user.name });
  } else {
    res.render('index1', { userRole: "visitor" });
  }
});

app.get('/index1', (req, res) => {
  console.log("index111");
  const isAuthenticated = req.isAuthenticated();
  if (isAuthenticated){
    res.render('index1', { userRole: req.user.role, userName: req.user.name });
  } else {
    res.render('index1', { userRole: "visitor" });
  }
});



app.get('/register', checkNotAuthenticatedTest, (req, res) => {
  const isAuthenticated = req.isAuthenticated();
  if (isAuthenticated){
    res.render('register', { userRole: req.user.role, userName: req.user.name });
  } else {
    res.render('register', { userRole: "visitor" });
  }
});

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const email = req.body.email;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = getUserByEmail(email);
    if (user) {
      req.flash('error', 'Email already exists');
      return res.status(400).render('register', { messages: req.flash() });
    }
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: email,
      password: hashedPassword,
      role: 'user'
    });
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.redirect('/register');
  }
});

app.get('/login', checkNotAuthenticated, (req, res) => {
  const isAuthenticated = req.isAuthenticated();
  if (isAuthenticated){
    res.render('login', { userRole: req.user.role, userName: req.user.name });
  } else {
    res.render('login', { userRole: "visitor" });
  }
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

app.post('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});



app.delete('/files/:name', (req, res) => {
  const s3 = new AWS.S3(); // Create a new S3 instance
  const deleteParams = { Bucket: BUCKETNAME, Key: req.params.name }; // Define parameters to delete the object
  s3.deleteObject(deleteParams, (err) => { // Delete the specified object
      if (err) {
          console.log(err); // Log any errors to the console
          res.status(500).send("Internal Server Error"); // Send a 500 error response on failure
      } else {
          res.send("File deleted successfully"); // Confirm deletion success
      }
  });
});



app.post('/search', async (req, res) => {
  try {
    let imgName = req.body.img;
    let folder = req.body.folder;
    const respons = await axios.post('http://127.0.0.1:5000/search', { folder, imgName });
    const files = respons.data.map(file => {
      const folderName = file.split("/")[0];; 
      const fileName = file.split("/")[1]; 
      return {
        folder: folderName,
        name: fileName,
        url: `https://${BUCKETNAME}.s3.amazonaws.com/${folderName}/${fileName}`
      };
    });
    res.json({files});
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
    res.redirect('/coverage');
  }
});


app.get('/coverages', (req, res) => {
  const s3 = createS3Instance();
  const listParams = { Bucket: BUCKETNAME, Delimiter: '/' }; // Add Delimiter parameter to list only folders
  // List folders
  s3.listObjectsV2(listParams, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
    const folders = data.CommonPrefixes.map(prefix => prefix.Prefix.replace('/', '')); // Extract folder names from CommonPrefixes
    // List files
    s3.listObjectsV2({ Bucket: BUCKETNAME }, (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
      }
      const files = data.Contents.map(file => {
        const folderName = path.dirname(file.Key);
        const fileName = path.basename(file.Key);
        const encodedFileName = encodeURIComponent(folderName + "/" + fileName);
        return {
          folder: folderName,
          name: fileName,
          url: `https://${BUCKETNAME}.s3.amazonaws.com/${file.Key}`,
          encodedurl: encodedFileName
        };
      });
      // Render the page based on authentication
      const isAuthenticated = req.isAuthenticated();
      const userRole = isAuthenticated ? req.user.role : "visitor";
      const userName = isAuthenticated ? req.user.name : null;
      res.render('coverages', { folders, files, userRole, userName });
    });
  });
});


app.get('/coverage', (req, res) => {
  const s3 = createS3Instance();
  const listParams = { Bucket: BUCKETNAME };
  
  s3.listObjectsV2(listParams, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    } else {
      const files = data.Contents.map(file => {
        const folderName = path.dirname(file.Key);
        const fileName = path.basename(file.Key);
        var encodedFileName = encodeURIComponent(folderName + "/" + fileName);
        return {
          folder: folderName,
          name: fileName,
          url: `https://${BUCKETNAME}.s3.amazonaws.com/${file.Key}`,
          encodedurl: encodedFileName
        };
      });
      const isAuthenticated = req.isAuthenticated();
      if (isAuthenticated) {
        res.render('coverage', {
          files,
          covrg: req.query.folder,
          userRole: req.user.role,
          userName: req.user.name
        });
      } else {
        res.render('coverage', {
          files,
          covrg: req.query.folder,
          userRole: "visitor",
          userName: null
          
        });
      }
    }
  });
});




app.get('/events', (req, res) => {
  const isAuthenticated = req.isAuthenticated();
  if (isAuthenticated){
    res.render('events', { userRole: req.user.role, userName: req.user.name });
  } else {
    res.render('events', { userRole: "visitor" });
  }
});

// AWS S3 File Operations Routes
app.get('/files', (req, res) => {
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
      
      res.json(files);
    }
  });
});

app.post('/upload', upload.array('files'), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
  const uploadPromises = req.files.map(file => {
    const uploadParams = {
      Bucket: BUCKETNAME,
      Key: `${req.body.folder}/`+file.originalname,
      Body: file.buffer
    };
    return s3.upload(uploadParams).promise();
  });
  Promise.all(uploadPromises)
    .then(() => res.redirect('/coverages'))
    .catch(err => res.status(500).json({ error: 'Error -> ' + err }));
});


// Error handling for undefined routes
app.all('*', (req, res) => {
  res.status(404).send('Resource not found');
});

// Start the server
require('dotenv').config(); // Add this line to load environment variables from .env file

// ...

const port = process.env.PORT || 3000; // Use the port from .env file or default to 3000

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
