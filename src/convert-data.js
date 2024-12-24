const fs = require('fs');
const path = require('path');

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

fs.readFile(path.join(__dirname, 'data.json'), (err, data) => {
    if (err) throw err;
    const json = JSON.parse(data);
    const updatedJson = json.map(entry => {
        const date = new Date(entry.timestamp);
        return {
            ...entry,
            day: dayNames[date.getDay()],
            month: monthNames[date.getMonth()]
        };
    });
    fs.writeFile(path.join(__dirname, 'data.json'), JSON.stringify(updatedJson, null, 2), (err) => {
        if (err) throw err;
        console.log('Data converted successfully!');
    });
});