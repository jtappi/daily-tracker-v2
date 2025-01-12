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
            // Sort the data in descending order based on the timestamp
            data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            const tbody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
            const resetBtn = document.getElementById('resetBtn');
            const overlay = document.getElementById('overlay');
            let filteredData = data;

            const renderTable = () => {
                const tableBody = document.getElementById('table-body');
                tableBody.innerHTML = ''; // Clear existing table rows
                filteredData.forEach((item, index) => {
                    const row = tbody.insertRow();
                    row.insertCell(0).textContent = item.text;
                    row.insertCell(1).textContent = item.category || '';
                    row.insertCell(2).textContent = item.cost || '';
                    const notesCell = row.insertCell(3);
                    const notesText = item.notes || '';
                    notesCell.textContent = notesText.length > 20 ? notesText.substring(0, 20) + '...' : notesText;
                    row.insertCell(4).textContent = item.day;
                    row.insertCell(5).textContent = item.month + ' ' + new Date(item.timestamp).getDate();
                    const timeCell = row.insertCell(6);
                    timeCell.textContent = item.time;

                    // Add actions column
                    const actionsCell = row.insertCell(7);
                    actionsCell.innerHTML = `
                        <i class="fas fa-edit edit-icon" data-index="${index}"></i>
                        <i class="fas fa-trash-alt delete-icon" data-index="${index}"></i>
                        <i class="fas fa-save save-icon d-none" data-index="${index}"></i>
                        <i class="fas fa-undo undo-icon d-none" data-index="${index}"></i>
                    `;

                    // Add click event to filter rows, excluding the Notes and Actions columns
                    Array.from(row.cells).forEach((cell, cellIndex) => {
                        const columnId = document.querySelector(`th:nth-child(${cellIndex + 1})`).id;
                        if (columnId !== 'notes-header' && columnId !== 'actions-header') { // Exclude the Notes and Actions columns
                            cell.addEventListener('click', filterHandler);
                        }
                    });
                });
                
            };

            const filterHandler = (event) => {
                const cell = event.currentTarget;
                const column = cell.parentElement.parentElement.parentElement.querySelector(`th:nth-child(${cell.cellIndex + 1})`).getAttribute('data-column');
                const value = cell.textContent;
                filterData(column, value);
            };

            renderTable();

            tbody.addEventListener('click', (event) => {
                const target = event.target;
                const index = target.getAttribute('data-index');
                if (target.classList.contains('edit-icon')) {
                    editRow(index);
                } else if (target.classList.contains('save-icon')) {
                    saveRow(index);
                } else if (target.classList.contains('undo-icon')) {
                    undoRow(index);
                } else if (target.classList.contains('delete-icon')) {
                    confirmDelete(index);
                }
            });

            function editRow(index) {
                const row = tbody.rows[index];
                row.classList.add('editing-row');
                for (let i = 0; i < row.cells.length - 1; i++) {
                    row.cells[i].contentEditable = 'true';
                    row.cells[i].removeEventListener('click', filterHandler); // Remove filter functionality
                }
                toggleIcons(row, true);
                Array.from(tbody.rows).forEach((r, i) => {
                    if (i !== index) {
                        r.classList.add('blur');
                    }
                });
                overlay.classList.remove('d-none');
            }

            function saveRow(index) {
                const row = tbody.rows[index];
                const updatedItem = {
                    id: filteredData[index].id, // Ensure the id is included
                    text: row.cells[0].innerText,
                    category: row.cells[1].innerText,
                    cost: row.cells[2].innerText,
                    notes: row.cells[3].innerText,
                    day: row.cells[4].innerText,
                    month: row.cells[5].innerText,
                    timestamp: row.cells[6].innerText
                };

                fetch(`/data/${updatedItem.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedItem)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(result => {
                    if (result.success) {
                        filteredData[index] = updatedItem;
                        for (let i = 0; i < row.cells.length - 1; i++) {
                            row.cells[i].contentEditable = 'false';
                            row.cells[i].addEventListener('click', filterHandler); // Re-add filter functionality
                        }
                        toggleIcons(row, false);
                        row.classList.remove('editing-row');
                        Array.from(tbody.rows).forEach((r) => {
                            r.classList.remove('blur');
                        });
                        overlay.classList.add('d-none');
                        showAlert('success', 'Item updated successfully');
                    } else {
                        showAlert('danger', 'Failed to update item');
                    }
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                    showAlert('danger', 'Failed to update item');
                });
            }

            function undoRow(index) {
                const row = tbody.rows[index];
                row.cells[0].innerText = filteredData[index].text;
                row.cells[1].innerText = filteredData[index].category;
                row.cells[2].innerText = filteredData[index].cost;
                row.cells[3].innerText = filteredData[index].notes;
                row.cells[4].innerText = filteredData[index].day;
                row.cells[5].innerText = filteredData[index].month;
                row.cells[6].innerText = filteredData[index].timestamp;
                for (let i = 0; i < row.cells.length - 1; i++) {
                    row.cells[i].contentEditable = 'false';
                    row.cells[i].addEventListener('click', filterHandler); // Re-add filter functionality
                }
                toggleIcons(row, false);
                row.classList.remove('editing-row');
                Array.from(tbody.rows).forEach((r) => {
                    r.classList.remove('blur');
                });
                overlay.classList.add('d-none');
            }

            function toggleIcons(row, isEditing) {
                row.querySelector('.edit-icon').classList.toggle('d-none', isEditing);
                row.querySelector('.delete-icon').classList.toggle('d-none', isEditing);
                row.querySelector('.save-icon').classList.toggle('d-none', !isEditing);
                row.querySelector('.undo-icon').classList.toggle('d-none', !isEditing);
            }

            function confirmDelete(index) {
                $('#deleteModal').modal('show');
                document.getElementById('confirmDelete').onclick = () => {
                    deleteRow(index);
                    $('#deleteModal').modal('hide');
                };
            }

            function deleteRow(index) {
                const id = filteredData[index].id;
                fetch(`/data/${id}`, {
                    method: 'DELETE'
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(result => {
                    if (result.success) {
                        filteredData.splice(index, 1);
                        renderTable();
                        showAlert('success', 'Item deleted successfully');
                    } else {
                        showAlert('danger', 'Failed to delete item');
                    }
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                    showAlert('danger', 'Failed to delete item');
                });
            }

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
    }, 1500);
}