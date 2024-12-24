document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const password = document.getElementById('password').value;
    fetch('/authenticate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
    }).then(response => response.json())
      .then(data => {
          if (data.success) {
              window.location.href = '/';
          } else {
              alert('Invalid password');
          }
      });
});