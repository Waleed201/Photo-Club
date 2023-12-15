// aws-s3.js

// Import necessary modules
const express = require('express'); // Import the Express framework for building web applications
const multer = require('multer'); // Import Multer for handling multipart/form-data (used for uploading files)
const AWS = require('aws-sdk'); // Import the AWS SDK to interact with AWS services
const app = express(); // Create an instance of Express

// Middleware setup
app.use(express.static('public')); // Serve static files from the 'public' directory
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data with the querystring library

// AWS S3 Bucket configuration
const BUCKETNAME = 'photo-club-s3'; // Define the S3 bucket name

// AWS SDK configuration
AWS.config.update({
    accessKeyId: 'AKIAYGINPQ2H42KMVZM3',
    secretAccessKey: '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',
    region: 'eu-north-1'
});

function createS3Instance() {
    return new AWS.S3();
}

module.exports = {
    createS3Instance,
    BUCKETNAME,
};

// Multer configuration for file uploads
const storage = multer.memoryStorage(); // Configure Multer to use memory storage (store files in memory)
const upload = multer({ storage }); // Create an upload instance with the specified storage

// Route Handlers
// Root route handler
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html'); // Serve the index.html file on root path access
});

// Files listing route handler
app.get('/files', (req, res) => {
    const s3 = new AWS.S3(); // Create a new S3 instance
    const listParams = { Bucket: BUCKETNAME }; // Define parameters for listing objects in S3 bucket
    s3.listObjectsV2(listParams, (err, data) => { // List objects in the specified bucket
        if (err) {
            console.log(err); // Log any errors to the console
            res.status(500).send("Internal Server Error"); // Send a 500 error response on failure
        } else {
            // Map S3 file data to a more user-friendly format
            const files = data.Contents.map(file => ({
                name: file.Key, // File name
                url: `https://${BUCKETNAME}.s3.amazonaws.com/${file.Key}` // File URL
            }));
            res.json(files); // Send the list of files as a JSON response
        }
    });
});

// File upload route handler
app.post('/upload', upload.array('files'), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files were uploaded.'); // Send error if no files are uploaded
    }
    const s3 = new AWS.S3(); // Create a new S3 instance
    // Map each uploaded file to a promise representing its upload to S3
    const uploadPromises = req.files.map(file => {
        const uploadParams = {
            Bucket: BUCKETNAME, // Bucket name
            Key: `${req.body.folder}/`+file.originalname, // File name in the bucket
            Body: file.buffer // File content
        };
        return s3.upload(uploadParams).promise(); // Return a promise to upload the file
    });
    // Wait for all file uploads to complete
    Promise.all(uploadPromises)
        .then(() => res.redirect('/')) // Redirect to root on success
        .catch(err => res.status(500).json({ error: 'Error -> ' + err })); // Send JSON error response on failure
});

// File deletion route handler
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

// File download route handler
app.get('/files/:name/download', (req, res) => {
    const s3 = new AWS.S3(); // Create a new S3 instance
    const downloadParams = { Bucket: BUCKETNAME, Key: req.params.name }; // Define parameters to download the object
    s3.getObject(downloadParams, (err, data) => { // Get the specified object
        if (err) {
            console.log(err); // Log any errors to the console
            res.status(500).send("Internal Server Error"); // Send a 500 error response on failure
        } else {
            res.attachment(req.params.name); // Set the header to indicate a file attachment
            res.send(data.Body); // Send the file data as the response body
        }
    });
});

// Start the server
// app.listen(5000, () => {
//     console.log('Server listening on port 5000'); // Log a message when the server starts listening
// });
