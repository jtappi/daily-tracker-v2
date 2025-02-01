document.addEventListener('DOMContentLoaded', () => {
    // Element references
    const categoryButtons = document.querySelectorAll('#categoryButtons .btn');
    const costInput = document.getElementById('costInput');
    const caloriesInput = document.getElementById('caloriesInput');
    const notesInput = document.getElementById('notesInput');
    const submitBtn = document.getElementById('submitBtn');
    let selectedCategory = null;

    // Single category button click handler
    function handleCategoryClick(button) {
        if (button.classList.contains('btn-primary')) {
            // Deselect if already selected
            button.classList.replace('btn-primary', 'btn-secondary');
            selectedCategory = null;
        } else {
            // Deselect all others
            categoryButtons.forEach(btn => btn.classList.replace('btn-primary', 'btn-secondary'));
            // Select this one
            button.classList.replace('btn-secondary', 'btn-primary');
            selectedCategory = button.dataset.category;
        }
        
        handleCategorySelection(selectedCategory);
        checkFormValidity();
    }

    // Add click listener to each category button
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => handleCategoryClick(button));
    });

    function handleCategorySelection(category) {
        // Enable inputs when a category is selected
        costInput.disabled = false;
        notesInput.disabled = false;

        // Enable calories input only if the Food category is selected
        if (category === 'Food') {
            caloriesInput.disabled = false;
        } else {
            caloriesInput.disabled = true;
        }
    }

    // Prevent decimal input in caloriesInput
    caloriesInput.addEventListener('input', () => {
        caloriesInput.value = caloriesInput.value.replace(/[^0-9]/g, '');
    });

    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const itemName = document.getElementById('itemName').value;
            const selectedCategory = document.querySelector('#categoryButtons .btn-primary').dataset.category;  // Get the selected category
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
                    
                    // Filter duplicates and limit to 3 results
                    const uniqueData = Array.from(new Map(data.map(item => [item.text, item])).values())
                        .slice(0, 3);

                    if (uniqueData.length > 0) {
                        suggestions.classList.add('show');
                        uniqueData.forEach(item => {
                            const a = document.createElement('a');
                            a.classList.add('dropdown-item');
                            a.textContent = item.text;
                            a.addEventListener('click', () => {
                                // Set text value
                                document.getElementById('itemName').value = item.text;
                                suggestions.innerHTML = '';
                                suggestions.classList.remove('show');

                                // Set category if exists
                                if (item.category) {
                                    const currentSelected = document.querySelector('#categoryButtons .btn-primary');
                                    if (currentSelected) {
                                        currentSelected.classList.replace('btn-primary', 'btn-secondary');
                                    }
                                    const categoryButton = document.querySelector(`[data-category="${item.category}"]`);
                                    if (categoryButton) {
                                        categoryButton.classList.replace('btn-secondary', 'btn-primary');
                                        handleCategorySelection(item.category);
                                    }
                                }

                                // Set additional fields
                                if (item.cost) document.getElementById('costInput').value = item.cost;
                                if (item.notes) document.getElementById('notesInput').value = item.notes;
                                
                                // Check form validity to enable submit
                                checkFormValidity();
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
        }, 1500);
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
            document.querySelectorAll('.categoryBtn').forEach(btn => btn.classList.remove('selected'));
            fetchTopItems();
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
                showEditNotesModal(item);
            });
            topItemsContainer.appendChild(button);
        });
    }

    function showEditNotesModal(item) {
        const modal = $('#editNotesModal');
        const textarea = document.getElementById('editNotesText');
        
        modal.on('shown.bs.modal', function() {
            textarea.focus();
        });
        
        modal.on('hidden.bs.modal', function() {
            document.activeElement.blur();
        });
        
        textarea.value = item.notes || '';
        
        const saveButton = document.getElementById('saveNotesBtn');
        saveButton.onclick = () => {
            const updatedNotes = textarea.value;
            submitItem(item.text, item.category, item.cost, updatedNotes, item.calories);
            modal.modal('hide');
        };
        
        modal.modal('show');
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

    function checkFormValidity() {
        const text = document.getElementById('itemName').value.trim();
        const category = document.querySelector('#categoryButtons .btn-primary');
        const submitBtn = document.getElementById('submitBtn');
        
        submitBtn.disabled = !text || !category;
        if(submitBtn.disabled) {
            document.getElementById('costInput').classList.add('hidden');
            document.getElementById('costInput').disabled = true;
            document.getElementById('notesInput').classList.add('hidden');
            document.getElementById('notesInput').disabled = true;
        }
    }

    document.getElementById('itemName').addEventListener('input', checkFormValidity);

    // Initial state
    submitBtn.disabled = true;
});