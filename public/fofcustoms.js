document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('contactForm').addEventListener('submit', function(event) {
        event.preventDefault();
        
        let formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            details: document.getElementById('details').value
        };
        
        fetch('https://your-api-endpoint.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('formMessage').innerText = 'Thank you for your submission!';
            document.getElementById('contactForm').reset();
        })
        .catch(error => {
            document.getElementById('formMessage').innerText = 'An error occurred. Please try again later.';
            console.error('Error:', error);
        });    
    });

    // Modal functionality
    const modal = document.getElementById("contactModal");
    const btn = document.getElementById("contactBtn");

    btn.addEventListener("click", function(event) {
        event.preventDefault(); // Prevent default link behavior
        modal.style.display = "block";
    });

    window.addEventListener("click", function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});