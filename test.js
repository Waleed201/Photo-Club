// const db = require('./DatabaseControl')


// const email = "admin@a"

// // let user = db.getUserByEmail(email, (error,data)=>{
// //     if(error){
// //         console.log(error)
// //     }else{
// //         return data
// //     }
// // });

// // console.log(user)
// let user

// async function getUser() {
//     try {
//         user = await db.getAllUsers();
//         console.log(user); // Work with the user data here
//     } catch (error) {
//         console.log(error);
//     }
// }

// getUser();


// Load the SDK
// const AWS = require('aws-sdk');

// // Connection
// // This is how you can use the .aws credentials file to fetch the credentials
// const credentials = new AWS.SharedIniFileCredentials({profile: 'wasabi'});
// AWS.config.credentials = credentials;

// // This is a configuration to directly use a profile from aws credentials file.
// AWS.config.credentials.accessKeyId = "IH74DRJCQGT6VP23DZ3M"
// AWS.config.credentials.secretAccessKey = "iQ72JUWWzf17ve9g1oBtKAzUBK1cI6BCK2ksJ3t8"

// // Set the AWS region. us-east-1 is default for IAM calls.
// AWS.config.region = "ap-southeast-1";

// // Set an endpoint.
// const ep = new AWS.Endpoint('s3.wasabisys.com');

// // Create an S3 client
// const s3 = new AWS.S3({endpoint: ep});

// // The following example retrieves an object for an S3 bucket.
// // set the details for the bucket and key
// const object_get_params = {
//     Bucket: "photo-club",
//     Key: "No"
// };

// // get the object that we just uploaded.
// // get the uploaded test_file
// s3.getObject(object_get_params, function(err, data) {
//     if (err) console.log(err, err.stack); // an error occurred
//     else     console.log(data);           // successful response
// });


// const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

// const s3Client = new S3Client({
//   region: 'ap-southeast-1',
//   credentials: {
//     accessKeyId: 'IH74DRJCQGT6VP23DZ3M',
//     secretAccessKey: 'iQ72JUWWzf17ve9g1oBtKAzUBK1cI6BCK2ksJ3t8',
//   },
//   endpoint: 'https://s3.ap-southeast-1.wasabisys.com',
// });


// const BUCKETNAME = 'photo-club';
// const objectKey = 'test/example.txt';

// const params = {
//   Bucket: BUCKETNAME,
//   Key: objectKey,
//   Body: 'Hello, this is the content of example.txt!',
// };

// async function uploadObject() {
//   try {
//     const response = await s3Client.send(new PutObjectCommand(params));
//     console.log('Object uploaded successfully:', response);
//   } catch (error) {
//     console.error('Error uploading object:', error);
//   }
// }

// // Call the function to upload the object
// uploadObject();



const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3'); // Add PutObjectCommand

const s3Client = new S3Client({
  region: 'ap-southeast-1',
  credentials: {
    accessKeyId: 'IH74DRJCQGT6VP23DZ3M',
    secretAccessKey: 'iQ72JUWWzf17ve9g1oBtKAzUBK1cI6BCK2ksJ3t8',
  },
  endpoint: 'https://s3.ap-southeast-1.wasabisys.com',
});

const BUCKETNAME = 'photo-club';
const objectKey = 'test/example.txt';

const params = {
  Bucket: BUCKETNAME,
  Key: objectKey,
  Body: 'Hello, this is the content of example.txt!',
};

async function uploadObject() {
  try {
    const response = await s3Client.send(new PutObjectCommand(params));
    console.log('Object uploaded successfully:', response);
  } catch (error) {
    console.error('Error uploading object:', error);
  }
}

// Call the function to upload the object
uploadObject();

