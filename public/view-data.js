document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = 'index.html';
});

document.addEventListener('DOMContentLoaded', () => {
    fetch('/data')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const tbody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
            tbody.innerHTML = '';
            data.forEach(item => {
                const row = tbody.insertRow();
                row.insertCell(0).textContent = item.text;
                row.insertCell(1).textContent = item.day;
                row.insertCell(2).textContent = item.month;
                row.insertCell(3).textContent = item.time;
            });
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
});

function sortTable(columnIndex) {
    const table = document.getElementById('dataTable');
    const rows = Array.from(table.rows).slice(1);
    const sortedRows = rows.sort((a, b) => {
        const aText = a.cells[columnIndex].textContent;
        const bText = b.cells[columnIndex].textContent;
        return aText.localeCompare(bText);
    });
    const tbody = table.getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';
    sortedRows.forEach(row => tbody.appendChild(row));
}