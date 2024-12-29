const fs = require('fs');
const path = require('path');

// Path to the data.json file
const dataFilePath = path.join(__dirname, '../src/data.json');

// Read the data.json file
fs.readFile(dataFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading data.json:', err);
        return;
    }

    // Parse the JSON data
    let jsonData;
    try {
        jsonData = JSON.parse(data);
    } catch (parseErr) {
        console.error('Error parsing JSON data:', parseErr);
        return;
    }

    // Update objects missing a category
    jsonData = jsonData.map(item => {
        if (!item.category) {
            item.category = 'none';
        }
        return item;
    });

    // Write the updated data back to the data.json file
    fs.writeFile(dataFilePath, JSON.stringify(jsonData, null, 2), 'utf8', writeErr => {
        if (writeErr) {
            console.error('Error writing to data.json:', writeErr);
            return;
        }
        console.log('data.json has been updated successfully.');
    });
});