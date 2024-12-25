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
                row.insertCell(1).textContent = item.category || '';
                row.insertCell(2).textContent = item.cost || '';
                const notesCell = row.insertCell(3);
                const notesText = item.notes || '';
                notesCell.textContent = notesText.length > 20 ? notesText.substring(0, 20) + '...' : notesText;
                if (notesText.length > 20) {
                    notesCell.setAttribute('data-toggle', 'tooltip');
                    notesCell.setAttribute('title', notesText);
                    notesCell.classList.add('notes-tooltip');
                }
                row.insertCell(4).textContent = item.day;
                row.insertCell(5).textContent = item.month;
                row.insertCell(6).textContent = item.time;
            });
            $('[data-toggle="tooltip"]').tooltip({
                template: '<div class="tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>',
                placement: 'top',
                trigger: 'click'
            });
        })
        .catch(error => {
            showAlert('danger', 'An error occurred while fetching data.');
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

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('notes-tooltip')) {
        $(event.target).tooltip('show');
    }
});

function showAlert(type, message) {
    const alertContainer = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = 'alert';
    alert.innerHTML = `
        ${message}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    `;
    alertContainer.appendChild(alert);
    setTimeout(() => {
        alert.classList.remove('show');
        alert.classList.add('hide');
        setTimeout(() => alert.remove(), 500);
    }, 5000);
}