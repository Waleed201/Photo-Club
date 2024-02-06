const db = require('./DatabaseControl')


const email = "admin@a"

// let user = db.getUserByEmail(email, (error,data)=>{
//     if(error){
//         console.log(error)
//     }else{
//         return data
//     }
// });

// console.log(user)
let user

async function getUser() {
    try {
        user = await db.getAllUsers();
        console.log(user); // Work with the user data here
    } catch (error) {
        console.log(error);
    }
}

getUser();
