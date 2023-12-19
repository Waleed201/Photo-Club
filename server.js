const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const multer = require('multer');
const AWS = require('aws-sdk');
const axios = require('axios');
const { initializePassport, checkAuthenticated, checkNotAuthenticatedTest, checkNotAuthenticated } = require('./utils');
const userData = require('./userData');
const eventData = require('./eventData');


const app = express();

// AWS S3 Configuration
AWS.config.update({
    accessKeyId: 'AKIAYGINPQ2H42KMVZM3',
    secretAccessKey: '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',
    region: 'eu-north-1'
});

const BUCKETNAME = 'photo-club-s3';
const s3 = new AWS.S3();
function createS3Instance() {
    return new AWS.S3();
}


// Multer Configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// User array and other initializations
let users;
let events;

// Define your helper functions



(async () => {
    users = await userData.loadUsers();
    events = eventData.loadEvents();
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
app.use(express.static('public')); // Adjust this path to your static files
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


// Add all your route handlers here as per the original file

app.get('/', (req, res) => {
    const isAuthenticated = req.isAuthenticated();
    if (isAuthenticated) {
        res.render('index1', { userRole: req.user.role, userName: req.user.name });
    } else {
        res.render('index1', { userRole: "visitor" });
    }
});

app.get('/index1', (req, res) => {
    const isAuthenticated = req.isAuthenticated();
    if (isAuthenticated) {
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
        role: req.body.role
      };
      users.push(newUser);
      await userData.saveUsers(users);
      res.redirect('/login');
    } catch (error) {
      console.error(error);
      res.redirect('/register');
    }
});

  
app.get('/login', checkNotAuthenticated, (req, res) => {
    const isAuthenticated = req.isAuthenticated();
    if (isAuthenticated) {
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

app.post('/logout', function (req, res, next) {
    req.logout(function (err) {
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
    const selectedFolder = req.query.folder; // Get the folder name from query parameter

    s3.listObjectsV2(listParams, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        } else {
            const files = data.Contents
                .filter(file => path.dirname(file.Key) === selectedFolder) // Filter by folder name
                .map(file => {
                    const folderName = path.dirname(file.Key);
                    const fileName = path.basename(file.Key);
                    return {
                        folder: folderName,
                        name: fileName,
                        url: `https://${BUCKETNAME}.s3.amazonaws.com/${file.Key}`
                    };
                });

            const isAuthenticated = req.isAuthenticated();
            // Render the coverage.ejs template with the filtered files
            res.render('coverage', {
                files: files,
                covrg: selectedFolder,
                userRole: isAuthenticated ? req.user.role : "visitor",
                userName: isAuthenticated ? req.user.name : null
            });
        }
    });
});
///////////////////////////


app.get('/events', (req, res) => {
    const isAuthenticated = req.isAuthenticated();
    if (isAuthenticated) {
        res.render('events', { userRole: req.user.role, userName: req.user.name , events: events});
    } else {
        res.render('events', { userRole: "visitor" , events: events});
    }
});

app.post



////////////////////////


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
  // blob:file:///308c84be-8dcf-4d09-8121-1c4bc100a9eb



// Error handling for undefined routes
app.all('*', (req, res) => {
    res.status(404).send('Resource not found');
});


require('dotenv').config(); // Add this line to load environment variables from .env file

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server is listening on port ${port}...`));
module.exports = app;
