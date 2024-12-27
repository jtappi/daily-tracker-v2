document.getElementById('viewDataBtn').addEventListener('click', () => {
    window.location.href = 'view-data.html';
});

document.getElementById('submitBtn').addEventListener('click', () => {
    const itemName = document.getElementById('itemName').value;
    const selectedCategory = document.querySelector('.categoryBtn.selected')?.dataset.category || null;
    const cost = document.getElementById('costInput').value || null;
    const notes = document.getElementById('notesInput').value || null;
    const calories = document.getElementById('caloriesInput').value || null;
    submitItem(itemName, selectedCategory, cost, notes, calories);
});

document.getElementById('itemName').addEventListener('input', () => {
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
});

document.querySelectorAll('.categoryBtn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.categoryBtn').forEach(btn => btn.classList.remove('selected'));
        btn.classList.add('selected');
        if (btn.dataset.category === 'Food') {
            document.getElementById('caloriesContainer').classList.remove('hidden');
        } else {
            document.getElementById('caloriesContainer').classList.add('hidden');
        }
    });
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

function submitItem(itemName, selectedCategory, cost, notes, calories) {
    fetch('/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: itemName, category: selectedCategory, cost: cost, notes: notes, calories: calories })
    }).then(response => {
        if (response.redirected) {
            console.log('Redirecting to:', response.url);
            document.getElementById('loadingSpinner').classList.remove('hidden');
            window.location.href = response.url;
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
      });
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('/top-items')
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
            const topItemsContainer = document.getElementById('topItems');
            topItemsContainer.innerHTML = '';
            data.forEach(item => {
                const button = document.createElement('button');
                button.classList.add('btn', 'btn-outline-secondary', 'm-1');
                button.textContent = item.text;
                button.addEventListener('click', () => {
                    submitItem(item.text, item.category, item.cost, item.notes);
                });
                topItemsContainer.appendChild(button);
            });
        })
        .catch((error) => {
            showAlert('danger', 'An error occurred while fetching top items.');
            console.error('Error:', error);
        });
});