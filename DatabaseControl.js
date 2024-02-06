const sqlite3 = require("sqlite3").verbose();

function connectToDB() {
    // Connect to DB
    const db = new sqlite3.Database(
      "new.db",
      sqlite3.OPEN_READWRITE,
      (err) => {
        if (err) return console.error(err.message);
      }
    );
    return db;
  }
  


function insertUser(user) {
    let db = connectToDB();
    return new Promise((resolve, reject) => {
        const { id, name, email, password, role } = user;
        db.run(`INSERT INTO Users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`, [id, name, email, password, role], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
        db.close();

    });
}

function insertEvent(event) {
    let db = connectToDB();
    return new Promise((resolve, reject) => {
        const { title, description, date, time, location } = event;
        db.run(`INSERT INTO Events (title, description, event_date, event_time, location) VALUES (?, ?, ?, ?, ?)`, [title, description, date, time, location], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
        db.close();

    });
}

function registerUserToEvent(userId, eventId) {
    let db = connectToDB();

    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO EventRegistrations (event_id, user_id) VALUES (?, ?)`, [eventId, userId], function(err) {
            if (err) reject(err);
            else resolve({ userId, eventId });
        });
        db.close();

    });
}

function getAllUsers() {
    let db = connectToDB();

    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM Users", (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
        db.close();

    });
}

function getUserById(userId) {
    let db = connectToDB();

    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM Users WHERE id = ?", [userId], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
        db.close();

    });
}

function getUserByEmail(userEmail) {
    let db = connectToDB();

    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM Users WHERE email = ?", [userEmail], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
        db.close();

    });
}

function getAllEvents() {
    let db = connectToDB();

    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM Events", (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
        db.close();

    });
}

function getEventById(eventId) {
    let db = connectToDB();

    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM Events WHERE id = ?", [eventId], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
        db.close();

    });
}

function getUsersForEvent(eventId) {
    let db = connectToDB();

    return new Promise((resolve, reject) => {
        db.all(`SELECT Users.* FROM Users JOIN EventRegistrations ON Users.id = EventRegistrations.user_id WHERE EventRegistrations.event_id = ?`, [eventId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
        db.close();

    });
}

function getEventsForUser(userId) {
    let db = connectToDB();

    return new Promise((resolve, reject) => {
        db.all(`SELECT Events.* FROM Events JOIN EventRegistrations ON Events.id = EventRegistrations.event_id WHERE EventRegistrations.user_id = ?`, [userId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
        db.close();

    });
}

function updateUser(userId, updatedInfo) {
    let db = connectToDB();

    return new Promise((resolve, reject) => {
        let baseQuery = 'UPDATE Users SET ';
        let updates = [];
        let values = [];

        for (const property in updatedInfo) {
            updates.push(`${property} = ?`);
            values.push(updatedInfo[property]);
        }

        let finalQuery = baseQuery + updates.join(', ') + ' WHERE id = ?';
        values.push(userId);

        db.run(finalQuery, values, function(err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
        db.close();

    });
}

function updateEvent(eventId, updatedInfo) {
    let db = connectToDB();
    return new Promise((resolve, reject) => {
        let baseQuery = 'UPDATE Events SET ';
        let updates = [];
        let values = [];

        for (const property in updatedInfo) {
            updates.push(`${property} = ?`);
            values.push(updatedInfo[property]);
        }

        let finalQuery = baseQuery + updates.join(', ') + ' WHERE id = ?';
        values.push(eventId);

        db.run(finalQuery, values, function(err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
        db.close();

    });
}

function deleteUser(userId) {
    let db = connectToDB();

    return new Promise((resolve, reject) => {
        db.run("DELETE FROM Users WHERE id = ?", [userId], function(err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
        db.close();

    });
}

function deleteEvent(eventId) {
    let db = connectToDB();

    return new Promise((resolve, reject) => {
        db.run("DELETE FROM Events WHERE id = ?", [eventId], function(err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
        db.close();

    });
}

function unregisterUserFromEvent(userId, eventId) {
    let db = connectToDB();

    return new Promise((resolve, reject) => {
        db.run("DELETE FROM EventRegistrations WHERE user_id = ? AND event_id = ?", [userId, eventId], function(err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
        db.close();
    });
}

module.exports = {
    insertUser,
    insertEvent,
    registerUserToEvent,
    getAllUsers,
    getUserById,
    getUserByEmail,
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
