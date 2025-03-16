document.addEventListener('DOMContentLoaded', () => {
// Add at top of file, after DOMContentLoaded
const CATEGORIES = ['Home', 'Medication', 'Bill', 'Health', 'Pain', 'Food', 'TO DO', 'Exercise'];

fetch('/data')
        .then(response => {
            if (response.status > 400) {
                return response.json();
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
                    row.cells[0].setAttribute('id', 'text-cell');
                    row.insertCell(1).textContent = item.category || '';
                    row.cells[1].setAttribute('id', 'category-cell');
                    row.insertCell(2).textContent = item.cost || '';
                    row.cells[2].setAttribute('id', 'cost-cell');
                    const notesCell = row.insertCell(3);
                    notesCell.setAttribute('id', 'notes-cell');
                    const notesText = item.notes || '';
                    notesCell.textContent = notesText.length > 20 ? notesText.substring(0, 20) + '...' : notesText;
                    row.insertCell(4).textContent = item.day;
                    row.cells[4].setAttribute('id', 'day-cell');
                    row.insertCell(5).textContent = item.month + ' ' + new Date(item.timestamp).getDate();
                    row.cells[5].setAttribute('id', 'month-cell');
                    const timeCell = row.insertCell(6);
                    timeCell.setAttribute('id', 'time-cell');
                    timeCell.textContent = item.time;

                    // Add actions column
                    const actionsCell = row.insertCell(7);
                    actionsCell.setAttribute('id', 'actions-cell');
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

            function getTimestampById(index) {
                const item = data[index];
                return item ? item.timestamp : null;
            }

            function editRow(index) {
                const row = tbody.rows[index];
                const timestamp = new Date(getTimestampById(index));
                const dateInput = document.createElement('input');
                dateInput.type = 'datetime-local';
                dateInput.id = 'entryDate';
                dateInput.className = 'form-control';
                dateInput.classList.add('d-block');
                
                const estTime = new Date(timestamp); // Use the original timestamp
                const formatter = new Intl.DateTimeFormat('en-CA', { // en-CA to get YYYY-MM-DD
                    timeZone: 'America/New_York',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false, // Use 24-hour format
                  });
                
                const estTimeString = formatter.format(estTime).replace(/\//g, '-').replace(', ', 'T');
                dateInput.value = estTimeString;
                
                row.classList.add('editing-row');
                
                // Add category dropdown
                const categoryCell = row.cells[1];
                const currentCategory = categoryCell.textContent;
                const select = document.createElement('select');
                select.className = 'form-control category-select';
                
                CATEGORIES.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = category;
                    if (category === currentCategory) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });
                
                categoryCell.textContent = '';
                categoryCell.appendChild(select);
                categoryCell.contentEditable = false;
                const nonEditableIds = ['time-cell', 'actions-cell', 'month-cell', 'day-cell'];
                for (let i = 0; i < row.cells.length - 1; i++) {
                    if (!nonEditableIds.includes(row.cells[i].id)) {
                        row.cells[i].contentEditable = 'true';
                    }
                    if (nonEditableIds.includes(row.cells[i].id)) {
                        if (row.cells[i].id === 'time-cell') {
                            row.cells[i].innerHTML = '';
                            row.cells[i].appendChild(dateInput);
                        }
                    }
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

            function toISOStringEST(date) {
                const dateEST = new Date(date);
                const formatter = new Intl.DateTimeFormat('en-US', {
                    timeZone: 'America/New_York',
                    year: 'numeric',
                    month: '2-digit',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                  });
                const estTimeString = formatter.format(dateEST);
                return estTimeString;
            }

            function convertDatetimeLocalToISO(datetimeLocalValue) {
                // Create a Date object from the datetime-local value
                const date = new Date(datetimeLocalValue);
                
                // Check if valid date
                if (isNaN(date.getTime())) {
                    return null;
                }
                
                // Convert to ISO string
                return toISOStringEST(date);
            }

            function saveRow(index) {
                // Prep Date values
                const dateInput = document.getElementById('entryDate');
                const date = dateInput.value;
                const day = new Date(date).toLocaleString('en-US', { timeZone: 'America/New_York', weekday: 'long' });
                const month = new Date(date).toLocaleString('en-US', { timeZone: 'America/New_York', month: 'long' });
                const time = new Date(date).toLocaleTimeString('en-US', { timeZone: 'America/New_York' });
                const timestamp = convertDatetimeLocalToISO(dateInput.value);

                const row = tbody.rows[index];
                const categorySelect = row.querySelector('.category-select');
                const updatedItem = {
                    id: filteredData[index].id, // Ensure the id is included
                    text: row.cells[0].innerText,
                    category: categorySelect ? categorySelect.value : row.cells[1].textContent,
                    cost: row.cells[2].innerText,
                    notes: row.cells[3].innerText,
                    day,
                    month,
                    time,
                    timestamp
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
                        // Fetch fresh data to update the table
                        fetch('/data')
                            .then(response => response.json())
                            .then(freshData => {
                                data = freshData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                                filteredData = data;
                                renderTable();
                                
                                // Refresh chart with current date
                                fetchDataAndRenderChart(getLocalDate());

                                toggleIcons(row, false);
                                row.classList.remove('editing-row');
                                Array.from(tbody.rows).forEach((r) => {
                                    r.classList.remove('blur');
                                });
                                overlay.classList.add('d-none');
                                showAlert('success', 'Item updated successfully');
                            });
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
                const categoryCell = row.cells[1];
                row.cells[0].innerText = filteredData[index].text;
                if (categoryCell.querySelector('.category-select')) {
                    categoryCell.textContent = filteredData[index].category;
                }
                // row.cells[1].innerText = filteredData[index].category;
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

            let chartInstance = null; // Variable to keep track of the chart instance

            // Function to fetch data and render chart
            function fetchDataAndRenderChart(date) {
                fetch('/data')
                    .then(response => response.json())
                    .then(data => {
                        // Filter and sort data for the selected date
                        const todaysData = data
                            .filter(item => item.timestamp.startsWith(date))
                            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

                        const timeValues = todaysData.map(item => item.time);
                        const categoryValues = todaysData.map(item => item.category || 'Uncategorized');
                        const uniqueCategoryValues = [...new Set(categoryValues)];

                        const ctx = document.getElementById('myChart').getContext('2d');

                        if (chartInstance) {
                            chartInstance.destroy();
                        }

                        chartInstance = new Chart(ctx, {
                            type: 'line',
                            data: {
                                labels: timeValues,
                                datasets: [{
                                    label: 'Category',
                                    data: categoryValues.map(category => uniqueCategoryValues.indexOf(category) + 1),
                                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                    borderColor: 'rgba(75, 192, 192, 1)',
                                    borderWidth: 1,
                                    fill: false,
                                    pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                                    pointBorderColor: '#fff',
                                    pointHoverBackgroundColor: '#fff',
                                    pointHoverBorderColor: 'rgba(75, 192, 192, 1)',
                                    pointRadius: 5,
                                    pointHoverRadius: 7,
                                    pointHitRadius: 10,
                                    pointStyle: 'circle'
                                }]
                            },
                            options: {
                                scales: {
                                    x: {
                                        title: {
                                            display: false,
                                            text: 'Time'
                                        }
                                    },
                                    y: {
                                        title: {
                                            display: false,
                                            text: 'Category'
                                        },
                                        ticks: {
                                            callback: function(value) {
                                                return uniqueCategoryValues[value - 1];
                                            }
                                        }
                                    }
                                },
                                plugins: {
                                    tooltip: {
                                        callbacks: {
                                            label: function(context) {
                                                const index = context.dataIndex;
                                                return `Category: ${categoryValues[index]} - ${todaysData[index].text}`;
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    })
                    .catch(error => {
                        console.error('There was a problem with the fetch operation:', error);
                    });
            }

            // Function to get the local date in yyyy-MM-dd format
            function getLocalDate() {
                return new Date().toLocaleDateString('en-CA'); // 'en-CA' locale formats date as yyyy-MM-dd
            }

            // Add event listener to the date input
            const chartDateInput = document.getElementById('chartDate');
            const today = getLocalDate();
            chartDateInput.value = today;

            const initialDate = chartDateInput.value === '' ? getLocalDate() : chartDateInput.value;

            chartDateInput.addEventListener('change', (event) => {
                const selectedDate = event.target.value === '' ? getLocalDate() : event.target.value;
                fetchDataAndRenderChart(selectedDate);
            });

            // Initial fetch and render for today's date
            fetchDataAndRenderChart(today);
            
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
                resetBtn.textContent = 'Reset Filter';
            };

            resetBtn.addEventListener('click', resetFilter);
        })
        .catch(error => {
            showAlert('danger', 'An error occurred while fetching data.');
            console.error('There was a problem with the fetch operation:', error);
            window.location.href = '/login.html';
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