const fs = require('fs');
const bcrypt = require('bcrypt');

const usersFilePath = 'users.json'; // Path to your JSON file

async function hashPassword(password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
}

async function loadUsers() {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading the users file:', err);
    return [];
  }
}

async function saveUsers(users) {
  try {
    const data = JSON.stringify(users, null, 2);
    fs.writeFileSync(usersFilePath, data, 'utf8');
  } catch (err) {
    console.error('Error writing to the users file:', err);
  }
}



module.exports = { loadUsers, saveUsers, hashPassword };
