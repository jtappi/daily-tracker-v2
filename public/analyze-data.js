document.addEventListener('DOMContentLoaded', () => {
    fetch('/data')
        .then(response => response.json())
        .then(data => {
            analyzeData(data);
        })
        .catch(error => console.error('Error fetching data:', error));

    // Attach sortTable and toggleTableVisibility functions to window to make them accessible from HTML
    window.sortTable = sortTable;
    window.toggleTableVisibility = toggleTableVisibility;

    // Add event listeners for sortable and collapsible table headers
    const categoryTableHeaders = document.querySelectorAll('#category-counts-table th');
    categoryTableHeaders.forEach((header, index) => {
        header.addEventListener('click', () => {
            sortTable('category-counts-table', index);
        });
    });

    const textTableHeaders = document.querySelectorAll('#text-counts-table th');
    textTableHeaders.forEach((header, index) => {
        header.addEventListener('click', () => {
            sortTable('text-counts-table', index);
        });
    });

    const categoryTableTitle = document.querySelectorAll('#categoryTitle');
    categoryTableTitle.forEach((header) => {
        header.addEventListener('click', () => {
            toggleTableVisibility('category-counts-table');
        });
    });

    const textTableTitle = document.querySelectorAll('#nameTitle');
    textTableTitle.forEach((header) => {
        header.addEventListener('click', () => {
            toggleTableVisibility('text-counts-table');
        });
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
        document.getElementById('last-entry-date-time').textContent = lastEntryDate.toLocaleString();
    }

    // Sorting function
    function sortTable(tableId, columnIndex) {
        const table = document.getElementById(tableId);
        const tbody = table.tBodies[0];
        const rows = Array.from(tbody.rows);
        const isAscending = table.getAttribute('data-sort-asc') === 'true';
        const direction = isAscending ? 1 : -1;

        rows.sort((a, b) => {
            const aText = a.cells[columnIndex].textContent.trim();
            const bText = b.cells[columnIndex].textContent.trim();

            if (!isNaN(aText) && !isNaN(bText)) {
                return direction * (aText - bText);
            }

            return direction * aText.localeCompare(bText);
        });

        rows.forEach(row => tbody.appendChild(row));
        table.setAttribute('data-sort-asc', !isAscending);
    }

    // Toggle table visibility
    function toggleTableVisibility(tableId) {
        const table = document.getElementById(tableId);
        table.style.display = table.style.display === 'table' ? 'none' : 'table';
    }
});