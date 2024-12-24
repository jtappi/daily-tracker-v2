document.getElementById('viewDataBtn').addEventListener('click', () => {
    window.location.href = 'view-data.html';
});

document.getElementById('submitBtn').addEventListener('click', () => {
    const textInput = document.getElementById('textInput').value;
    fetch('/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: textInput })
    }).then(response => response.json())
      .then(data => {
          console.log('Success:', data);
          document.getElementById('textInput').value = '';
          document.getElementById('suggestions').innerHTML = '';
      })
      .catch((error) => {
          console.error('Error:', error);
      });
});

document.getElementById('textInput').addEventListener('input', () => {
    const query = document.getElementById('textInput').value;
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
                        document.getElementById('textInput').value = item.text;
                        suggestions.innerHTML = '';
                    });
                    suggestions.appendChild(li);
                });
            });
    } else {
        document.getElementById('suggestions').innerHTML = '';
    }
});