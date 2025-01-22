document.addEventListener('DOMContentLoaded', () => {
    const data = {
        tasks: [],
        completed: []
    };

    function persistData() {
        // Save to localStorage
        localStorage.setItem('eisenhowerMatrixData', JSON.stringify(data));
        
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
        li.textContent = task.content;
        li.setAttribute('data-id', task.id);
        li.addEventListener('click', completeTask);
        // Add touch event listeners for mobile devices
        li.addEventListener('touchstart', completeTask);
        ol.appendChild(li);
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

    const savedData = localStorage.getItem('eisenhowerMatrixData');
    if (savedData) {
        Object.assign(data, JSON.parse(savedData));
        populateData();
    }
});