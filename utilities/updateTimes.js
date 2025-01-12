const fs = require('fs');
const path = require('path');
const dataFilePath = path.join(__dirname, '../src/data.json');

// Function to convert timestamp to EST time string
function convertToEST(date) {
    // const estOffset = -5 * 60; // EST offset in minutes
    // const estDate = new Date(date.getTime() + estOffset * 60 * 1000);
    // return estDate.toLocaleTimeString('en-US', { hour12: true });
    return date.toLocaleTimeString('en-US', { hour12: true, timeZone: 'America/New_York' });
}

function convertUTCToEST(utcDateTime) {
    // Parse the UTC ISO string into a Date object
    console.log('UTC DateTime:', utcDateTime);
    const utcDate = utcDateTime;
  
    // Convert to EST/EDT using toLocaleString and format for ISO
    const options = {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
  
    // Convert and split the result to reformat
    const estDateTime = utcDate.toLocaleString('en-US', options);
    console.log('EST DateTime:', estDateTime);
    const [datePart, timePart] = estDateTime.split(', ');
    const [month, day, year] = datePart.split('/');
  
    return `${year}-${month}-${day}T${timePart}`;
}
  
  // Example Usage
//   const utcDateTime = '2025-01-11T15:00:00Z'; // UTC ISO DateTime
//   const estDateTime = convertUTCToEST(utcDateTime);
//   console.log(estDateTime); // Outputs ISO DateTime in EST/EDT
  

// Function to update time values in data.json
function updateTimes() {
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading data file:', err);
            return;
        }

        let jsonData = JSON.parse(data);
        let updatedCount = 0;
        const updatedItems = [];

        jsonData = jsonData.map(item => {
            const timestampDate = new Date(item.timestamp);
            console.log('Timestamp Date:', timestampDate);
            const localTimeStampDate = convertUTCToEST(timestampDate);
            const timeParts = item.time.match(/(\d{1,2}):(\d{2}):(\d{2})\s?(AM|PM)/i);

            if (!timeParts) {
                console.warn(`Skipping item with invalid time format: ${item.id}, ${item.time}`);
                return item;
            }

            const hours = timeParts[4].toUpperCase() === 'PM' ? (parseInt(timeParts[1]) % 12) + 12 : parseInt(timeParts[1]) % 12;
            const minutes = parseInt(timeParts[2]);
            const seconds = parseInt(timeParts[3]);
            const timeDate = new Date(timestampDate);
            timeDate.setHours(hours, minutes, seconds, 0);

            const timeDifference = Math.abs(timestampDate - timeDate) / 1000 / 60; // Difference in minutes

            if (timeDifference > 2) {
                const initialTime = item.time;
                item.time = convertToEST(timestampDate);
                item.timestamp = localTimeStampDate;
                updatedItems.push({ id: item.id, initialTime, updatedTime: item.time, initialTimestamp: timestampDate, updatedTimestamp: localTimeStampDate });
                updatedCount++;
            }

            return item;
        });

        fs.writeFile(dataFilePath, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing data file:', err);
                return;
            }

            console.log('Data updated successfully!');
            console.log(`Total items updated: ${updatedCount}`);
            updatedItems.forEach(item => {
                console.log(`ID: ${item.id}, Initial Time: ${item.initialTime}, Updated Time: ${item.updatedTime}, Initial Timestamp: ${item.initialTimestamp}, Updated Timestamp: ${item.updatedTimestamp}`);
            });
        });
    });
}

// Run the update function
updateTimes();