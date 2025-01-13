document.addEventListener('DOMContentLoaded', () => {
    fetch('/data')
        .then(response => response.json())
        .then(data => {
            analyzeData(data);
        })
        .catch(error => console.error('Error fetching data:', error));
});

function analyzeData(data) {
    const categoryCounts = {};
    const textCounts = {};
    const dateCounts = {};
    let lastEntryDate = null;

    data.forEach(item => {
        // Count categories
        const category = item.category || 'Uncategorized';
        if (categoryCounts[category]) {
            categoryCounts[category]++;
        } else {
            categoryCounts[category] = 1;
        }

        // Count texts
        const text = item.text || 'Untitled';
        if (textCounts[text]) {
            textCounts[text]++;
        } else {
            textCounts[text] = 1;
        }

        // Count dates
        const date = item.timestamp.split('T')[0];
        if (dateCounts[date]) {
            dateCounts[date]++;
        } else {
            dateCounts[date] = 1;
        }

        // Determine last entry date
        const entryDate = new Date(item.timestamp);
        if (!lastEntryDate || entryDate > lastEntryDate) {
            lastEntryDate = entryDate;
        }
    });

    // Calculate average entries per day
    const totalEntries = data.length;
    const totalDays = Object.keys(dateCounts).length;
    const averageEntriesPerDay = (totalEntries / totalDays).toFixed(2);

    // Update the dashboard
    document.getElementById('average-entries-per-day').textContent = averageEntriesPerDay;

    // Populate category counts table
    const categoryCountsTableBody = document.getElementById('category-counts-table').querySelector('tbody');
    for (const [category, count] of Object.entries(categoryCounts)) {
        const row = categoryCountsTableBody.insertRow();
        row.insertCell(0).textContent = category;
        row.insertCell(1).textContent = count;
    }

    // Populate text counts table
    const textCountsTableBody = document.getElementById('text-counts-table').querySelector('tbody');
    for (const [text, count] of Object.entries(textCounts)) {
        const row = textCountsTableBody.insertRow();
        row.insertCell(0).textContent = text;
        row.insertCell(1).textContent = count;
    }

    // Update last entry date and time
    document.getElementById('last-entry-date-time').textContent = lastEntryDate.toLocaleString('en-US', { timeZone: 'America/New_York' });
}