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
        
        // Add days since creation
        const daysSpan = document.createElement('span');
        daysSpan.className = 'days-old';
        const daysSinceCreation = Math.floor((new Date() - new Date(task.created)) / (1000 * 60 * 60 * 24));
        daysSpan.textContent = `${daysSinceCreation}d`;
        
        const noteIcon = document.createElement('i');
        noteIcon.className = `fas fa-sticky-note ${task.notes ? 'has-notes' : ''}`;
        noteIcon.setAttribute('data-id', task.id);
        noteIcon.addEventListener('click', editNotes);
        
        li.appendChild(checkIcon);
        li.appendChild(textSpan);
        li.appendChild(daysSpan);
        li.appendChild(noteIcon);
        
        li.addEventListener('dragstart', handleDragStart);
        div.appendChild(li);
    }

    function editNotes(event) {
        const taskId = this.getAttribute('data-id');
        const taskIndex = data.tasks.findIndex(task => task.id == taskId);
        if (taskIndex > -1) {
            const task = data.tasks[taskIndex];
            showNotesModal(task, this);
        }
    }

    function showNotesModal(task, noteIcon) {
        const modal = $('#editNotesModal');
        const textarea = document.getElementById('editNotesText');
        
        modal.on('shown.bs.modal', function() {
            textarea.focus();
        });
        
        textarea.value = task.notes || '';
        
        const saveButton = document.getElementById('saveNotesBtn');
        const originalHandler = saveButton.onclick;
        saveButton.onclick = () => {
            task.notes = textarea.value;
            noteIcon.classList.toggle('has-notes', !!task.notes);
            persistData();
            modal.modal('hide');
        };
        
        modal.on('hidden.bs.modal', function() {
            document.activeElement.blur();
            saveButton.onclick = originalHandler;
        });
        
        modal.modal('show');
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
            console.log('Redirecting to login page from the Eisenhower Matrix');
            window.location.href = '/login.html';            
        });

        
    // Fallback to localStorage if server fetch fails.  Not needed today
    // const savedData = localStorage.getItem('eisenhowerMatrixData');
    // if (savedData) {
    //     Object.assign(data, JSON.parse(savedData));
    //     populateData();
    // }

    // Questions functionality
    function appendQuestionToTable(question) {
        const tbody = document.querySelector('#questions-table tbody');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="question-cell" data-id="${question.id}">${question.question}</td>
            <td class="answer-cell" data-id="${question.id}">${question.answer || ''}</td>
            <td>${question.creationDate}</td>
            <td>${question.answeredDate || ''}</td>
            <td>
                <i class="fas fa-edit edit-question" data-id="${question.id}"></i>
                <i class="fas fa-save save-question d-none" data-id="${question.id}"></i>
                <i class="fas fa-trash-alt delete-question" data-id="${question.id}"></i>
            </td>
        `;

        addQuestionEventListeners(tr);
        tbody.appendChild(tr);
    }

    function addQuestionEventListeners(tr) {
        tr.querySelector('.edit-question').addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const questionCell = tr.querySelector(`.question-cell[data-id="${id}"]`);
            const answerCell = tr.querySelector(`.answer-cell[data-id="${id}"]`);
            
            questionCell.contentEditable = true;
            answerCell.contentEditable = true;
            questionCell.focus();
            
            this.classList.add('d-none');
            tr.querySelector('.save-question').classList.remove('d-none');
        });

        tr.querySelector('.save-question').addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const questionCell = tr.querySelector(`.question-cell[data-id="${id}"]`);
            const answerCell = tr.querySelector(`.answer-cell[data-id="${id}"]`);
            
            const answer = answerCell.textContent.trim();
            const updateData = {
                question: questionCell.textContent.trim(),
                answer: answer,
                answeredDate: answer.length > 0 ? new Date().toLocaleString("en-US", { timeZone: "America/New_York"}) : null
            };
            
            updateQuestion(id, updateData);
            
            questionCell.contentEditable = false;
            answerCell.contentEditable = false;
            
            this.classList.add('d-none');
            tr.querySelector('.edit-question').classList.remove('d-none');
        });

        tr.querySelector('.delete-question').addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this question?')) {
                deleteQuestion(id);
                tr.remove();
            }
        });
    }

    async function updateQuestion(id, data) {
        try {
            const response = await fetch(`/questions/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) throw new Error('Failed to update question');
            return await response.json();
        } catch (error) {
            console.error('Error updating question:', error);
            alert('Failed to update question');
        }
    }

    async function deleteQuestion(id) {
        try {
            const response = await fetch(`/questions/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete question');
            return await response.json();
        } catch (error) {
            console.error('Error deleting question:', error);
            alert('Failed to delete question');
        }
    }

    async function submitQuestion(questionText) {
        try {
            const response = await fetch('/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: questionText })
            });

            const result = await response.json();
            if (result.id) {
                appendQuestionToTable(result);
            }
        } catch (error) {
            console.error('Error saving question:', error);
        }
    }

    function loadQuestions() {
        fetch('/questions')
            .then(response => response.json())
            .then(questions => {
                questions.forEach(question => appendQuestionToTable(question));
            })
            .catch(error => {
                console.error('Error loading questions:', error);
            });
    }

    // Initialize questions functionality
    const questionQuadrant = document.querySelector('#questions');
    const questionsList = questionQuadrant.querySelector('.div-list');

    // Create input container
    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter question';
    
    const submitBtn = document.createElement('button');
    submitBtn.innerHTML = '<i class="fas fa-plus"></i>';
    submitBtn.className = 'submit-question';
    
    inputContainer.appendChild(input);
    inputContainer.appendChild(submitBtn);
    questionQuadrant.insertBefore(inputContainer, questionsList);

    // Add event listeners
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && this.value.trim() !== '') {
            submitQuestion(this.value.trim());
            this.value = '';
        }
    });

    submitBtn.addEventListener('click', function() {
        if (input.value.trim() !== '') {
            submitQuestion(input.value.trim());
            input.value = '';
        }
    });

    // Load existing questions
    loadQuestions();

}); // End of DOMContentLoaded