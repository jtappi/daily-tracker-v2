document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/authenticate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });

        if (response.ok) {
            // Handle successful authentication
            window.location.href = '/index.html';
        } else {
            // Handle authentication failure
            alert('Authentication failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred');
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