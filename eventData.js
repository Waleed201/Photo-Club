const fs = require('fs');

const eventsFilePath = 'events.json'; // Path to your JSON file for events

// Function to load events from the JSON file
function loadEvents() {
  try {
    const data = fs.readFileSync(eventsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading the events file:', err);
    return []; // Return an empty array if there's an error
  }
}

// Function to save events to the JSON file
function saveEvents(events) {
  try {
    const data = JSON.stringify(events, null, 2); // Beautify the JSON when saving
    fs.writeFileSync(eventsFilePath, data, 'utf8');
  } catch (err) {
    console.error('Error writing to the events file:', err);
  }
}

module.exports = { loadEvents, saveEvents };
