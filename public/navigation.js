document.addEventListener('DOMContentLoaded', () => {
    const backToLoginBtn = document.getElementById('backToLoginBtn');
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', () => {
            window.location.href = '/login.html';
        });
    }

    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '/index.html';
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Clear authentication tokens or session data
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('authToken');
            // Delete the connect.sid cookie for trackmyweek.com
            document.cookie = "connect.sid=;expires=" + new Date(0).toUTCString() + ";path=/;domain=trackmyweek.com;secure";
            console.log('Attempted to delete connect.sid cookie for trackmyweek.com');
            // Redirect to login page
            window.location.href = '/login.html';
        });
    }

    const analyzeDataBtn = document.getElementById('analyzeDataBtn');
    if (analyzeDataBtn) {
        analyzeDataBtn.addEventListener('click', () => {
            window.location.href = '/analyze-data.html'; // Adjust the URL as needed
        });
    }

    const viewAllDataBtn = document.getElementById('viewAllDataBtn');
    if (viewAllDataBtn) {
        viewAllDataBtn.addEventListener('click', () => {
            window.location.href = 'view-data.html';
        });
    }

    const emBtn = document.getElementById('emBtn');
    if (emBtn) {
        emBtn.addEventListener('click', () => {
            window.open('eisenhowerMatrix_v2.html', '_blank', 'noopener,noreferrer');
        });
    }
});