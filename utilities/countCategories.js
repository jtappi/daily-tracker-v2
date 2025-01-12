const fs = require('fs');
const path = require('path');
const dataFilePath = path.join(__dirname, '../src/data.json');

// Function to count category occurrences
function countCategories() {
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading data file:', err);
            return;
        }

        const jsonData = JSON.parse(data);
        const categoryCounts = {};

        jsonData.forEach(item => {
            const category = item.category || 'Uncategorized';
            if (categoryCounts[category]) {
                categoryCounts[category]++;
            } else {
                categoryCounts[category] = 1;
            }
        });

        console.log('Category Counts:', categoryCounts);
    });
}

// Run the count function
countCategories();