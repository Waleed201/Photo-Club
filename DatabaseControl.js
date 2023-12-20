const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('new.db'); // Replace with your database file path

// Insert User
function insertUser(user, callback) {
    const { id, name, email, password, role } = user;
    db.run(`INSERT INTO Users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`, [id, name, email, password, role], callback);
}

// Insert Event
function insertEvent(event, callback) {
    const { title, description, date, time, location } = event;
    db.run(`INSERT INTO Events (title, description, event_date, event_time, location) VALUES (?, ?, ?, ?, ?)`, [title, description, date, time, location], callback);
}

// Register User to Event
function registerUserToEvent(userId, eventId, callback) {
    db.run(`INSERT INTO EventRegistrations (event_id, user_id) VALUES (?, ?)`, [eventId, userId], callback);
}

// Get All Users
function getAllUsers(callback) {
    db.all("SELECT * FROM Users", callback);
}

// Get User by ID
function getUserById(userId, callback) {
    db.get("SELECT * FROM Users WHERE id = ?", [userId], callback);
}

// Get All Events
function getAllEvents(callback) {
    db.all("SELECT * FROM Events", callback);
}

// Get Event by ID
function getEventById(eventId, callback) {
    db.get("SELECT * FROM Events WHERE id = ?", [eventId], callback);
}

// Get Users for Event
function getUsersForEvent(eventId, callback) {
    db.all(`SELECT Users.* FROM Users 
            JOIN EventRegistrations ON Users.id = EventRegistrations.user_id 
            WHERE EventRegistrations.event_id = ?`, [eventId], callback);
}

// Get Events for User
function getEventsForUser(userId, callback) {
    db.all(`SELECT Events.* FROM Events 
            JOIN EventRegistrations ON Events.id = EventRegistrations.event_id 
            WHERE EventRegistrations.user_id = ?`, [userId], callback);
}

// Update User
// Update User
function updateUser(userId, updatedInfo, callback) {
    let baseQuery = 'UPDATE Users SET ';
    let updates = [];
    let values = [];

    for (const property in updatedInfo) {
        updates.push(`${property} = ?`);
        values.push(updatedInfo[property]);
    }

    let finalQuery = baseQuery + updates.join(', ') + ' WHERE id = ?';
    values.push(userId);

    db.run(finalQuery, values, callback);
}

// Update Event
function updateEvent(eventId, updatedInfo, callback) {
    let baseQuery = 'UPDATE Events SET ';
    let updates = [];
    let values = [];

    for (const property in updatedInfo) {
        updates.push(`${property} = ?`);
        values.push(updatedInfo[property]);
    }

    let finalQuery = baseQuery + updates.join(', ') + ' WHERE id = ?';
    values.push(eventId);

    db.run(finalQuery, values, callback);
}


// Delete User
function deleteUser(userId, callback) {
    db.run("DELETE FROM Users WHERE id = ?", [userId], callback);
}

// Delete Event
function deleteEvent(eventId, callback) {
    db.run("DELETE FROM Events WHERE id = ?", [eventId], callback);
}

// Unregister User from Event
function unregisterUserFromEvent(userId, eventId, callback) {
    db.run("DELETE FROM EventRegistrations WHERE user_id = ? AND event_id = ?", [userId, eventId], callback);
}

module.exports = {
    insertUser,
    insertEvent,
    registerUserToEvent,
    getAllUsers,
    getUserById,
    getAllEvents,
    getEventById,
    getUsersForEvent,
    getEventsForUser,
    updateUser,
    updateEvent,
    deleteUser,
    deleteEvent,
    unregisterUserFromEvent
};
