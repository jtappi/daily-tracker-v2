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
                row.insertCell(4).textContent = item.category || '';
                row.insertCell(5).textContent = item.cost || '';    
                row.insertCell(6).textContent = item.notes || '';
            });
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
});

document.querySelectorAll('#dataTable th').forEach(header => {
    header.addEventListener('click', () => {
        const table = document.getElementById('dataTable');
        const tbody = table.getElementsByTagName('tbody')[0];
        const rows = Array.from(tbody.rows);
        const column = header.getAttribute('data-column');
        const order = header.getAttribute('data-order') === 'asc' ? 'desc' : 'asc';
        header.setAttribute('data-order', order);

        rows.sort((a, b) => {
            const aText = a.cells[header.cellIndex].textContent;
            const bText = b.cells[header.cellIndex].textContent;

            if (order === 'asc') {
                return aText.localeCompare(bText, undefined, { numeric: true });
            } else {
                return bText.localeCompare(aText, undefined, { numeric: true });
            }
        });

        tbody.innerHTML = '';
        rows.forEach(row => tbody.appendChild(row));
    });
});