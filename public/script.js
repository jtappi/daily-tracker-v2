document.addEventListener('DOMContentLoaded', () => {
    const backToLoginBtn = document.getElementById('backToLoginBtn');
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', () => {
            window.location.href = '/login.html';
        });
    }

    const viewAllDataBtn = document.getElementById('viewAllDataBtn');
    if (viewAllDataBtn) {
        viewAllDataBtn.addEventListener('click', () => {
            window.location.href = '/view-data.html'; // Adjust the URL as needed
        });
    }

    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const itemName = document.getElementById('itemName').value;
            const selectedCategory = document.querySelector('.categoryBtn input:checked')?.parentElement.dataset.category || null;
            const cost = document.getElementById('costInput')?.value || null;
            const notes = document.getElementById('notesInput')?.value || null;
            const calories = document.getElementById('caloriesInput')?.value || null;
            submitItem(itemName, selectedCategory, cost, notes, calories);
        });
    }

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    const fetchSuggestions = debounce(() => {
        const query = document.getElementById('itemName').value;
        if (query.length >= 3) {
            fetch(`/search?query=${query}`)
                .then(response => {
                    if (response.redirected) {
                        console.log('Redirecting to:', response.url);
                        document.getElementById('loadingSpinner').classList.remove('hidden');
                        window.location.href = response.url;
                        return;
                    }
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    const suggestions = document.getElementById('suggestions');
                    suggestions.innerHTML = '';
                    if (data.length > 0) {
                        suggestions.classList.add('show');
                        data.forEach(item => {
                            const a = document.createElement('a');
                            a.classList.add('dropdown-item');
                            a.textContent = item.text;
                            a.addEventListener('click', () => {
                                document.getElementById('itemName').value = item.text;
                                suggestions.innerHTML = '';
                                suggestions.classList.remove('show');
                                if (item.category) {
                                    document.querySelector(`.categoryBtn[data-category="${item.category}"]`).classList.add('selected');
                                }
                                if (item.cost) {
                                    document.getElementById('costInput').value = item.cost;
                                }
                                if (item.notes) {
                                    document.getElementById('notesInput').value = item.notes;
                                }
                            });
                            suggestions.appendChild(a);
                        });
                    } else {
                        suggestions.classList.remove('show');
                    }
                    document.getElementById('categoryButtons').classList.remove('hidden');
                    document.getElementById('costInput').classList.remove('hidden');
                    document.getElementById('costInput').disabled = false;
                    document.getElementById('notesInput').classList.remove('hidden');
                    document.getElementById('notesInput').disabled = false;
                })
                .catch((error) => {
                    showAlert('danger', 'An error occurred while fetching suggestions.');
                    console.error('Error:', error);
                    window.location.href = '/login.html';
                });
        } else {
            document.getElementById('suggestions').innerHTML = '';
            document.getElementById('suggestions').classList.remove('show');
            document.getElementById('categoryButtons').classList.add('hidden');
            document.getElementById('costInput').classList.add('hidden');
            document.getElementById('costInput').disabled = true;
            document.getElementById('notesInput').classList.add('hidden');
            document.getElementById('notesInput').disabled = true;
        }
    }, 300);

    document.getElementById('itemName').addEventListener('input', fetchSuggestions);

    document.querySelectorAll('.categoryBtn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.categoryBtn').forEach(btn => btn.classList.remove('selected'));
            btn.classList.add('selected');
            if (btn.dataset.category === 'Food') {
                document.getElementById('caloriesContainer').classList.remove('hidden');
                document.getElementById('costInput').classList.remove('hidden');
                document.getElementById('costInput').disabled = false;
                document.getElementById('notesInput').classList.remove('hidden');
                document.getElementById('notesInput').disabled = false;
            } else {
                document.getElementById('caloriesContainer').classList.add('hidden');
                document.getElementById('costInput').classList.remove('hidden');
                document.getElementById('costInput').disabled = false;
                document.getElementById('notesInput').classList.remove('hidden');
                document.getElementById('notesInput').disabled = false;
            }
        });
    });

    const alertContainer = document.getElementById('alertContainer');

    function showAlert(type, message) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.role = 'alert';
        alert.innerHTML = `
            ${message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            `;
        alertContainer.appendChild(alert);
        setTimeout(() => {
            alert.classList.remove('show');
            alert.classList.add('hide');
            setTimeout(() => alert.remove(), 500);
        }, 5000);
    }

    function submitItem(itemName, selectedCategory, cost, notes, calories) {
        fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: itemName, category: selectedCategory, cost: cost, notes: notes, calories: calories })
        }).then(response => {
            if (response.status > 400) {
                window.location.href = '/login.html';
                return;
            }
            return response.json();
        })
        .then(data => {
            if (data.message) {
                showAlert('success', data.message);
            }
            document.getElementById('itemName').value = '';
            document.getElementById('suggestions').innerHTML = '';
            document.getElementById('suggestions').classList.remove('show');
            document.getElementById('categoryButtons').classList.add('hidden');
            document.getElementById('costInput').classList.add('hidden');
            document.getElementById('costInput').disabled = true;
            document.getElementById('notesInput').classList.add('hidden');
            document.getElementById('notesInput').disabled = true;
            document.getElementById('caloriesContainer').classList.add('hidden');
            document.querySelectorAll('.categoryBtn').forEach(btn => btn.classList.remove('selected'));
        })
        .catch((error) => {
            showAlert('danger', 'An error occurred while submitting the data.');
            console.error('Error:', error);
            window.location.href = '/login.html';
        });
    }

    async function fetchTopItems() {
        try {
            const response = await fetch('/top-items');
            if (response.status > 400) {
                window.location.href = '/login.html';
                return;
            }
            const topItems = await response.json();
            displayTopItems(topItems);
        } catch (error) {
            console.error('Error:', error);
            window.location.href = '/login.html';
        }
    }

    function displayTopItems(items) {
        const topItemsContainer = document.getElementById('topItems');
        if (!topItemsContainer) {
            console.error('Element with ID "topItems" not found');
            return;
        }
        topItemsContainer.innerHTML = '';
        items.forEach(item => {
            const button = document.createElement('button');
            button.classList.add('btn', 'btn-outline-secondary', 'm-1');
            button.textContent = item.text;
            button.addEventListener('click', () => {
                submitItem(item.text, item.category, item.cost, item.notes);
            });
            topItemsContainer.appendChild(button);
        });
    }

    // Call fetchTopItems when the page loads
    fetchTopItems();

    // Show category buttons when item name is typed
    document.getElementById('itemName').addEventListener('input', () => {
        const categoryButtons = document.getElementById('categoryButtons');
        if (document.getElementById('itemName').value.length > 0) {
            categoryButtons.classList.remove('hidden');
        } else {
            categoryButtons.classList.add('hidden');
        }
    });
});