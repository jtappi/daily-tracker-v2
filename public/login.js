document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const password = document.getElementById('password').value;

            // Hash the password before sending it to the server
            const hashedPassword = CryptoJS.SHA256(password).toString();

            try {
                const response = await fetch('/authenticate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ password: hashedPassword })
                });

                const result = await response.json();

                if (result.success) {
                    // Handle successful authentication
                    window.location.href = '/index.html';
                } else {
                    // Handle authentication failure
                    showAlert('danger', 'Authentication failed. Please try again.');
                }
            } catch (error) {
                console.error('Error:', error);
                showAlert('danger', 'An error occurred. Please try again.');
            }
        });
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
}