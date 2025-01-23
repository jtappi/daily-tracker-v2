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

    function appendTaskToList(task, ol) {
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
        
        li.appendChild(checkIcon);
        li.appendChild(textSpan);
        
        li.addEventListener('dragstart', handleDragStart);
        ol.appendChild(li);
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

    function populateData() {
        document.querySelectorAll('.quadrant ol').forEach(ol => ol.innerHTML = '');
        document.querySelector('#completed-table tbody').innerHTML = '';

        data.tasks.forEach(task => {
            const quadrant = document.querySelector(`#${task.quadrant} ol`);
            if (quadrant) {
                appendTaskToList(task, quadrant);
            }
        });

        data.completed.forEach(completedTask => {
            const tbody = document.querySelector('#completed-table tbody');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${completedTask.content}</td>
                <td>${completedTask.quadrant}</td>
                <td>${completedTask.created}</td>
                <td>${completedTask.completed}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    document.querySelectorAll('.quadrant').forEach(quadrant => {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Enter task';
        quadrant.appendChild(input);

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && this.value.trim() !== '') {
                const task = {
                    id: Date.now(),
                    content: this.value.trim(),
                    quadrant: quadrant.id,
                    created: new Date().toLocaleString("en-US", { timeZone: "America/New_York"})
                };
                data.tasks.push(task);
                persistData();
                const ol = quadrant.querySelector('ol');
                appendTaskToList(task, ol);

                this.value = '';
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