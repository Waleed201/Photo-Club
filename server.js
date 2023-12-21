// Import necessary libraries and modules
const express = require('express'); // Express.js framework for web applications
const path = require('path'); // Node.js path module for working with file paths
const bcrypt = require('bcrypt'); // Library for password hashing
const passport = require('passport'); // Passport.js for authentication
const flash = require('express-flash'); // Middleware for flash messages
const session = require('express-session'); // Middleware for session handling
const methodOverride = require('method-override'); // Middleware for HTTP method override
const multer = require('multer'); // Middleware for handling file uploads
const AWS = require('aws-sdk'); // AWS SDK for interacting with Amazon S3
const axios = require('axios'); // HTTP client for making requests
const {
  initializePassport,
  checkAuthenticated,
  checkNotAuthenticatedTest,
  checkNotAuthenticated,
} = require('./utils'); // Custom authentication middleware
const userData = require('./userData'); // User data module
const eventData = require('./eventData'); // Event data module

// Create an Express.js application instance
const app = express();

// AWS S3 Configuration
AWS.config.update({
  accessKeyId: 'AKIAYGINPQ2H42KMVZM3', // AWS Access Key
  secretAccessKey: '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', // AWS Secret Access Key
  region: 'eu-north-1', // AWS region
});

const BUCKETNAME = 'photo-club-s3'; // Amazon S3 bucket name
const s3 = new AWS.S3(); // Create an S3 instance

function createS3Instance() {
  return new AWS.S3();
}

// Multer Configuration for file uploads
const storage = multer.memoryStorage(); // Store uploaded files in memory
const upload = multer({ storage }); // Configure multer with the storage engine

// Initialize arrays to store user and event data
let users;
let events;

// Load user and event data asynchronously
(async () => {
  users = await userData.loadUsers(); // Load user data
  events = eventData.loadEvents(); // Load event data
})();

// Helper functions to find user by email and ID
const getUserByEmail = (email) => {
  return users.find((user) => user.email === email);
};

const getUserById = (id) => {
  return users.find((user) => user.id === id);
};

initializePassport(passport, getUserByEmail, getUserById); // Initialize Passport.js for authentication

// Express app configuration
app.set('view engine', 'ejs'); // Set the view engine to EJS
app.use(express.static('public')); // Serve static files from the 'public' directory
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded request bodies
app.use(flash()); // Enable flash messages
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret', // Session secret key
    resave: false,
    saveUninitialized: false,
  })
); // Configure session middleware
app.use(passport.initialize()); // Initialize Passport.js
app.use(passport.session()); // Use Passport.js for session management
app.use(methodOverride('_method')); // Enable HTTP method override
app.use(express.static('./SWE363 Project/css'));
app.use(express.static('./SWE363 Project/fonts'));
app.use(express.static('./SWE363 Project/js'));
app.use(express.static('./SWE363 Project/images'));
app.use(express.static('./Face_recognition/your_script.by'));
app.use(methodOverride('_method'));
app.use(express.json());

// Define your routes

// Root route - Home page
app.get('/', (req, res) => {
  const isAuthenticated = req.isAuthenticated();
  if (isAuthenticated) {
    res.render('index1', { userRole: req.user.role, userName: req.user.name });
  } else {
    res.render('index1', { userRole: 'visitor' });
  }
});

// Index1 route - Another route with similar behavior
app.get('/index1', (req, res) => {
  const isAuthenticated = req.isAuthenticated();
  if (isAuthenticated) {
    res.render('index1', { userRole: req.user.role, userName: req.user.name });
  } else {
    res.render('index1', { userRole: 'visitor' });
  }
});

// Register route - Display registration form
app.get('/register', checkNotAuthenticatedTest, (req, res) => {
  const isAuthenticated = req.isAuthenticated();
  if (isAuthenticated) {
    res.render('register', { userRole: req.user.role, userName: req.user.name });
  } else {
    res.render('register', { userRole: 'visitor' });
  }
});

// Register route - Handle registration form submission
app.post('/register', checkNotAuthenticatedTest, async (req, res) => {
  try {
    const user = getUserByEmail(req.body.email);
    if (user) {
      req.flash('error', 'Email already exists');
      return res.status(400).render('register', { messages: req.flash() });
    }
    const newUser = {
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 10),
      role: req.body.role,
    };
    users.push(newUser);
    await userData.saveUsers(users);
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.redirect('/register');
  }
});

// Login route - Display login form
app.get('/login', checkNotAuthenticated, (req, res) => {
  const isAuthenticated = req.isAuthenticated();
  if (isAuthenticated) {
    res.render('login', { userRole: req.user.role, userName: req.user.name });
  } else {
    res.render('login', { userRole: 'visitor' });
  }
});

// Login route - Handle login form submission
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true,
}));

// Logout route - Handle user logout
app.post('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

// Delete file route - Delete a file from S3
app.delete('/files/:name', (req, res) => {
  const s3 = new AWS.S3(); // Create a new S3 instance
  const deleteParams = { Bucket: BUCKETNAME, Key: req.params.name }; // Define parameters to delete the object
  s3.deleteObject(deleteParams, (err) => { // Delete the specified object
    if (err) {
      console.log(err); // Log any errors to the console
      res.status(500).send('Internal Server Error'); // Send a 500 error response on failure
    } else {
      res.send('File deleted successfully'); // Confirm deletion success
    }
  });
});

// Search route - Search for files in S3
app.post('/search', async (req, res) => {
  try {
    let imgName = req.body.img;
    let folder = req.body.folder;
    const respons = await axios.post('http://127.0.0.1:5000/search', { folder, imgName });
    const files = respons.data.map(file => {
      const folderName = file.split("/")[0];
      const fileName = file.split("/")[1];
      return {
        folder: folderName,
        name: fileName,
        url: `https://${BUCKETNAME}.s3.amazonaws.com/${folderName}/${fileName}`
      };
    });
    res.json({ files });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
    res.redirect('/coverage');
  }
});

// Coverages route - Display list of folders and files in S3
app.get('/coverages', (req, res) => {
  const s3 = createS3Instance();
  const listParams = { Bucket: BUCKETNAME, Delimiter: '/' }; // Add Delimiter parameter to list only folders
  // List folders
  s3.listObjectsV2(listParams, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }
    const folders = data.CommonPrefixes.map(prefix => prefix.Prefix.replace('/', '')); // Extract folder names from CommonPrefixes
    // List files
    s3.listObjectsV2({ Bucket: BUCKETNAME }, (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }
      const files = data.Contents.map(file => {
        const folderName = path.dirname(file.Key);
        const fileName = path.basename(file.Key);
        const encodedFileName = encodeURIComponent(folderName + '/' + fileName);
        return {
          folder: folderName,
          name: fileName,
          url: `https://${BUCKETNAME}.s3.amazonaws.com/${file.Key}`,
          encodedurl: encodedFileName
        };
      });
      // Render the page based on authentication
      const isAuthenticated = req.isAuthenticated();
      const userRole = isAuthenticated ? req.user.role : 'visitor';
      const userName = isAuthenticated ? req.user.name : null;
      res.render('coverages', { folders, files, userRole, userName });
    });
  });
});

// Coverage route - Display files within a selected folder
app.get('/coverage', (req, res) => {
  const s3 = createS3Instance();
  const listParams = { Bucket: BUCKETNAME };
  const selectedFolder = req.query.folder; // Get the folder name from query parameter

  s3.listObjectsV2(listParams, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    } else {
      const files = data.Contents
        .filter(file => path.dirname(file.Key) === selectedFolder) // Filter by folder name
        .map(file => {
          const folderName = path.dirname(file.Key);
          const fileName = path.basename(file.Key);
          const encodedFileName = encodeURIComponent(folderName + '/' + fileName);

          return {
            folder: folderName,
            name: fileName,
            url: `https://${BUCKETNAME}.s3.amazonaws.com/${file.Key}`,
            encodedurl: encodedFileName
          };
        });

      const isAuthenticated = req.isAuthenticated();
      // Render the coverage.ejs template with the filtered files
      res.render('coverage', {
        files: files,
        covrg: selectedFolder,
        userRole: isAuthenticated ? req.user.role : 'visitor',
        userName: isAuthenticated ? req.user.name : null
      });
    }
  });
});

// Events route - Display a list of events
app.get('/events', (req, res) => {
  const isAuthenticated = req.isAuthenticated();
  if (isAuthenticated) {
    res.render('events', { userRole: req.user.role, userName: req.user.name, events: events });
  } else {
    res.render('events', { userRole: 'visitor', events: events });
  }
});

// AWS S3 File Operations Routes

// Files route - List all files in S3
app.get('/files', (req, res) => {
  const listParams = { Bucket: BUCKETNAME };
  s3.listObjectsV2(listParams, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    } else {
      const files = data.Contents.map(file => ({
        name: file.Key,
        url: `https://${BUCKETNAME}.s3.amazonaws.com/${file.Key}`
      }));
      res.json(files);
    }
  });
});

// Upload route - Handle file uploads to S3
app.post('/upload', upload.array('files'), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
  const uploadPromises = req.files.map(file => {
    const uploadParams = {
      Bucket: BUCKETNAME,
      Key: `${req.body.folder}/` + file.originalname,
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

// Load environment variables from .env file
require('dotenv').config();

// Define the port for the Express server
const port = process.env.PORT || 5000;

// Start the Express server and listen on the defined port
app.listen(port, () => console.log(`Server is listening on port ${port}...`));

// Export the Express app for testing purposes
module.exports = app;
