document.addEventListener('DOMContentLoaded', () => {
    const data = {
        tasks: [],
        completed: []
    };

    function persistData() {
        // // removing all of the localStorage code until i figure out if/where we need it
        // // Save to localStorage
        // localStorage.setItem('eisenhowerMatrixData', JSON.stringify(data));
        
        // Save to server
        fetch('/save-matrix-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .catch(error => console.error('Error saving data:', error));
    }

    function appendTaskToList(task, div) {
        div.className = 'div-list';
        const li = document.createElement('li');
        li.className = 'task-item';
        li.draggable = true;
        li.setAttribute('data-id', task.id);
        
        const checkIcon = document.createElement('i');
        checkIcon.className = 'fas fa-check-circle';
        checkIcon.setAttribute('data-id', task.id);
        checkIcon.addEventListener('click', completeTask);

        const textSpan = document.createElement('span');
        textSpan.textContent = task.content;
        
        const noteIcon = document.createElement('i');
        noteIcon.className = `fas fa-sticky-note ${task.notes ? 'has-notes' : ''}`;
        noteIcon.setAttribute('data-id', task.id);
        noteIcon.addEventListener('click', editNotes);
        
        li.appendChild(checkIcon);
        li.appendChild(textSpan);
        li.appendChild(noteIcon);
        
        li.addEventListener('dragstart', handleDragStart);
        div.appendChild(li);
    }

    function editNotes(event) {
        const taskId = this.getAttribute('data-id');
        const taskIndex = data.tasks.findIndex(task => task.id == taskId);
        if (taskIndex > -1) {
            const task = data.tasks[taskIndex];
            // Show modal or prompt for notes
            const notes = prompt('Enter notes:', task.notes || '');
            if (notes !== null) {
                task.notes = notes;
                this.classList.toggle('has-notes', !!notes);
                persistData();
            }
        }
    }

    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.getAttribute('data-id'));
        e.target.classList.add('dragging');
    }

    function initDragAndDrop() {
        document.querySelectorAll('.quadrant').forEach(quadrant => {
            quadrant.addEventListener('dragover', e => {
                e.preventDefault();
            });
            
            quadrant.addEventListener('drop', e => {
                e.preventDefault();
                const taskId = e.dataTransfer.getData('text/plain');
                const taskElement = document.querySelector(`[data-id="${taskId}"]`);
                
                if (taskElement) {
                    const taskIndex = data.tasks.findIndex(t => t.id == taskId);
                    if (taskIndex > -1) {
                        // Update task quadrant
                        data.tasks[taskIndex].quadrant = quadrant.id;
                        persistData();
                        populateData();
                    }
                }
                
                document.querySelector('.dragging')?.classList.remove('dragging');
            });
        });
    }

    function completeTask(event) {
        event.preventDefault();
        const taskId = this.getAttribute('data-id');
        const taskIndex = data.tasks.findIndex(task => task.id == taskId);
        if (taskIndex > -1) {
            const task = data.tasks.splice(taskIndex, 1)[0];
            task.completed = new Date().toLocaleString("en-US", { timeZone: "America/New_York"});
            data.completed.push(task);
            persistData();
            populateData();
        }
    }

    function deleteCompletedTask(index) {
        data.completed.splice(index, 1);
        persistData();
        populateData();
    }

    function populateData() {
        // Clear only task lists, not input containers
        document.querySelectorAll('.quadrant .div-list').forEach(div => div.innerHTML = '');
        document.querySelector('#completed-table tbody').innerHTML = '';

        data.tasks.forEach(task => {
            const quadrant = document.querySelector(`#${task.quadrant} .div-list`);
            if (quadrant) {
                appendTaskToList(task, quadrant);
            }
        });

        data.completed.forEach((completedTask, index) => {
            const tbody = document.querySelector('#completed-table tbody');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${completedTask.content}</td>
                <td>${completedTask.quadrant}</td>
                <td class="notes-cell" data-index="${index}">${completedTask.notes}</td>
                <td>${completedTask.created}</td>
                <td>${completedTask.completed}</td>
                <td>
                    <i class="fas fa-edit edit-completed" data-index="${index}"></i>
                    <i class="fas fa-save save-completed d-none" data-index="${index}"></i>
                    <i class="fas fa-trash-alt delete-completed" data-index="${index}"></i>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Add click handlers for edit icons
        document.querySelectorAll('.edit-completed').forEach(icon => {
            icon.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                const notesCell = document.querySelector(`.notes-cell[data-index="${index}"]`);
                notesCell.contentEditable = true;
                notesCell.focus();
                
                // Toggle icons
                this.classList.add('d-none');
                this.nextElementSibling.classList.remove('d-none');
            });
        });

        // Add click handlers for save icons
        document.querySelectorAll('.save-completed').forEach(icon => {
            icon.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                const notesCell = document.querySelector(`.notes-cell[data-index="${index}"]`);
                
                // Update data
                data.completed[index].notes = notesCell.textContent;
                persistData();
                
                // Disable editing
                notesCell.contentEditable = false;
                
                // Toggle icons
                this.classList.add('d-none');
                this.previousElementSibling.classList.remove('d-none');
            });
        });

        // Add click handlers for delete icons
        document.querySelectorAll('.delete-completed').forEach(icon => {
            icon.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                deleteCompletedTask(index);
            });
        });
    }

    function createTask(quadrant, value) {
        const task = {
            id: Date.now(),
            content: value.trim(),
            quadrant: quadrant.id,
            notes: '',
            created: new Date().toLocaleString("en-US", { timeZone: "America/New_York"})
        };
        data.tasks.push(task);
        persistData();
        
        // Create div-list if it doesn't exist
        let listDiv = quadrant.querySelector('.div-list');
        if (!listDiv) {
            listDiv = document.createElement('div');
            listDiv.className = 'div-list';
            quadrant.appendChild(listDiv);
        }
        
        appendTaskToList(task, listDiv);
    }

    document.querySelectorAll('.quadrant').forEach(quadrant => {
        // Create div-list container if it doesn't exist
        let listDiv = quadrant.querySelector('.div-list');
        if (!listDiv) {
            listDiv = document.createElement('div');
            listDiv.className = 'div-list';
            quadrant.appendChild(listDiv);
        }

        const inputContainer = document.createElement('div');
        inputContainer.className = 'input-container';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Enter task';
        
        const submitBtn = document.createElement('button');
        submitBtn.innerHTML = '<i class="fas fa-plus"></i>';
        submitBtn.className = 'submit-task';
        
        inputContainer.appendChild(input);
        inputContainer.appendChild(submitBtn);
        quadrant.insertBefore(inputContainer, listDiv);

        // Handle Enter key
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && this.value.trim() !== '') {
                createTask(quadrant, this.value);
                this.value = '';
            }
        });

        // Handle button click
        submitBtn.addEventListener('click', function() {
            if (input.value.trim() !== '') {
                createTask(quadrant, input.value);
                input.value = '';
            }
        });
    });

    initDragAndDrop();

    fetch('/get-matrix-data')
        .then(response => response.json())
        .then(savedData => {
            if (savedData) {
                Object.assign(data, savedData);
                populateData();
            }
        })
        .catch(error => {
            console.error('Error loading matrix data:', error);
            // Fallback to localStorage if server fetch fails
            const localData = localStorage.getItem('eisenhowerMatrixData');
            if (localData) {
                Object.assign(data, JSON.parse(localData));
                populateData();
            }
        });

        
    // Fallback to localStorage if server fetch fails.  Not needed today
    // const savedData = localStorage.getItem('eisenhowerMatrixData');
    // if (savedData) {
    //     Object.assign(data, JSON.parse(savedData));
    //     populateData();
    // }
});