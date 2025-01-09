const fs = require('fs');
const path = require('path');

// Path to the data.json file
const dataFilePath = path.join(__dirname, '../src/data.json');

// Read the existing data from the data.json file
fs.readFile(dataFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading data file:', err);
        return;
    }

    let jsonData = JSON.parse(data);

    // Add an id property to each object
    jsonData = jsonData.map((item, index) => ({
        id: index + 1,
        ...item
    }));

    // Write the updated data back to the data.json file
    fs.writeFile(dataFilePath, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Error writing data file:', err);
            return;
        }

        console.log('Data file updated successfully');
    });
});