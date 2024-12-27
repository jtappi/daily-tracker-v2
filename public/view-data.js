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
            const resetBtn = document.getElementById('resetBtn');
            let filteredData = data;

            const renderTable = () => {
                tbody.innerHTML = '';
                filteredData.forEach(item => {
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
                    const timeCell = row.insertCell(6);
                    timeCell.textContent = item.time;
                    timeCell.setAttribute('data-timestamp', item.timestamp);

                    // Add click event to filter rows
                    Array.from(row.cells).forEach(cell => {
                        cell.addEventListener('click', () => {
                            const column = cell.parentElement.parentElement.parentElement.querySelector(`th:nth-child(${cell.cellIndex + 1})`).getAttribute('data-column');
                            const value = cell.textContent;
                            filterData(column, value);
                        });
                    });
                });
                $('[data-toggle="tooltip"]').tooltip({
                    template: '<div class="tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>',
                    placement: 'top',
                    trigger: 'click'
                });
            };

            renderTable();

            const filterData = (column, value) => {
                filteredData = data.filter(item => item[column] === value);
                renderTable();
                resetBtn.classList.remove('hidden');
                resetBtn.textContent = `Reset (Filtered by ${column}: ${value})`;
            };

            const resetFilter = () => {
                filteredData = data;
                renderTable();
                resetBtn.classList.add('hidden');
                resetBtn.textContent = 'Reset';
            };

            resetBtn.addEventListener('click', resetFilter);
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
            let aText, bText;
            if (column === 'timestamp') {
                aText = a.cells[header.cellIndex].getAttribute('data-timestamp');
                bText = b.cells[header.cellIndex].getAttribute('data-timestamp');
            } else {
                aText = a.cells[header.cellIndex].textContent;
                bText = b.cells[header.cellIndex].textContent;
            }

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