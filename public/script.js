document.getElementById('viewDataBtn').addEventListener('click', () => {
    window.location.href = 'view-data.html';
});

document.getElementById('submitBtn').addEventListener('click', () => {
    const itemName = document.getElementById('itemName').value;
    const selectedCategory = document.querySelector('.categoryBtn.selected')?.dataset.category || null;
    const cost = document.getElementById('costInput').value || null;
    const notes = document.getElementById('notesInput').value || null;
    fetch('/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: itemName, category: selectedCategory, cost: cost, notes: notes })
    }).then(response => response.json())
      .then(data => {
          console.log('Success:', data);
          document.getElementById('itemName').value = '';
          document.getElementById('suggestions').innerHTML = '';
          document.getElementById('categoryButtons').classList.add('hidden');
          document.getElementById('costInput').classList.add('hidden');
          document.getElementById('costInput').disabled = true;
          document.getElementById('notesInput').classList.add('hidden');
          document.getElementById('notesInput').disabled = true;
          document.querySelectorAll('.categoryBtn').forEach(btn => btn.classList.remove('selected'));
      })
      .catch((error) => {
          console.error('Error:', error);
      });
});

document.getElementById('itemName').addEventListener('input', () => {
    const query = document.getElementById('itemName').value;
    if (query.length >= 3) {
        fetch(`/search?query=${query}`)
            .then(response => response.json())
            .then(data => {
                const suggestions = document.getElementById('suggestions');
                suggestions.innerHTML = '';
                data.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item.text;
                    li.addEventListener('click', () => {
                        document.getElementById('itemName').value = item.text;
                        suggestions.innerHTML = '';
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
                    suggestions.appendChild(li);
                });
                document.getElementById('categoryButtons').classList.remove('hidden');
                document.getElementById('costInput').classList.remove('hidden');
                document.getElementById('costInput').disabled = false;
                document.getElementById('notesInput').classList.remove('hidden');
                document.getElementById('notesInput').disabled = false;
            });
    } else {
        document.getElementById('suggestions').innerHTML = '';
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
    });
});