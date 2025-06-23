document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const pendingTasksList = document.getElementById('pendingTasksList');
    const completedTasksList = document.getElementById('completedTasksList');
    const completedCount = document.getElementById('completedCount');
    const modal = document.getElementById('confirmationModal');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const cancelDeleteBtn = document.getElementById('cancelDelete');
    const currentDateEl = document.getElementById('currentDate');
    const pieChart = document.getElementById('pieChart');
    const completionPercentage = document.getElementById('completionPercentage');
    const completedTasks = document.getElementById('completedTasks');
    const totalTasks = document.getElementById('totalTasks');
    const productivityMessage = document.getElementById('productivityMessage');
    const currentMonthYear = document.getElementById('currentMonthYear');
    const calendarGrid = document.getElementById('calendarGrid');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');

    // State variables
    let tasks = JSON.parse(localStorage.getItem('pokemon-tasks')) || [];
    let taskToDelete = null;
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    // Initialize the app
    function init() {
        updateCurrentDate();
        renderTasks();
        updateStats();
        renderCalendar();
        
        // Event listeners
        addTaskBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addTask();
        });
        confirmDeleteBtn.addEventListener('click', deleteTask);
        cancelDeleteBtn.addEventListener('click', closeModal);
        prevMonthBtn.addEventListener('click', showPreviousMonth);
        nextMonthBtn.addEventListener('click', showNextMonth);
    }

    // Update current date display
    function updateCurrentDate() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateEl.textContent = currentDate.toLocaleDateString('en-US', options);
    }

    // Add new task
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') return;

        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            date: currentDate.toISOString(),
            completedDate: null
        };

        tasks.push(newTask);
        saveTasks();
        renderTasks();
        updateStats();
        renderCalendar();
        taskInput.value = '';
        taskInput.focus();
        
        // Animation for new task
        const newTaskElement = pendingTasksList.lastElementChild;
        newTaskElement.style.animation = 'taskAdded 0.3s forwards';
    }

    // Render all tasks
    function renderTasks() {
        pendingTasksList.innerHTML = '';
        completedTasksList.innerHTML = '';

        if (tasks.filter(task => !task.completed).length === 0) {
            pendingTasksList.innerHTML = '<li class="empty-message">No pending tasks! Add some!</li>';
        } else {
            tasks.filter(task => !task.completed).forEach(task => {
                pendingTasksList.appendChild(createTaskElement(task));
            });
        }

        if (tasks.filter(task => task.completed).length === 0) {
            completedTasksList.innerHTML = '<li class="empty-message">No completed tasks yet!</li>';
        } else {
            tasks.filter(task => task.completed).forEach(task => {
                completedTasksList.appendChild(createTaskElement(task));
            });
        }
    }

    // Create task element
    function createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        const date = new Date(task.date);
        const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        li.innerHTML = `
            <span class="task-text">${task.text}</span>
            <span class="task-date">${dateString}</span>
            <div class="task-actions">
                <button class="task-btn complete-btn">
                    <img src="${task.completed ? 'pending.png' : 'work2.png'}" class="icon" alt="${task.completed ? 'Undo' : 'Complete'}">
                </button>
                <button class="task-btn delete-btn">
                    <img src="pending.png" class="icon" alt="Delete">
                </button>
            </div>
        `;

        // Add event listeners
        const completeBtn = li.querySelector('.complete-btn');
        const deleteBtn = li.querySelector('.delete-btn');

        completeBtn.addEventListener('click', () => toggleTaskCompletion(task.id));
        deleteBtn.addEventListener('click', () => showDeleteConfirmation(task.id));

        return li;
    }

    // Toggle task completion status
    function toggleTaskCompletion(taskId) {
        tasks = tasks.map(task => {
            if (task.id === taskId) {
                return { 
                    ...task, 
                    completed: !task.completed,
                    completedDate: task.completed ? null : new Date().toISOString()
                };
            }
            return task;
        });
        saveTasks();
        renderTasks();
        updateStats();
        renderCalendar();
    }

    // Show delete confirmation modal
    function showDeleteConfirmation(taskId) {
        taskToDelete = taskId;
        modal.style.display = 'flex';
    }

    // Delete task after confirmation
    function deleteTask() {
        tasks = tasks.filter(task => task.id !== taskToDelete);
        saveTasks();
        renderTasks();
        updateStats();
        renderCalendar();
        closeModal();
    }

    // Close modal
    function closeModal() {
        modal.style.display = 'none';
        taskToDelete = null;
    }

    // Update stats and pie chart
    function updateStats() {
        const completed = tasks.filter(task => task.completed).length;
        const total = tasks.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        completedCount.textContent = completed;
        completedTasks.textContent = completed;
        totalTasks.textContent = total;
        completionPercentage.textContent = `${percentage}%`;
        
        // Update pie chart
        pieChart.style.background = `conic-gradient(var(--dark-accent) ${percentage}%, #e0e0e0 ${percentage}% 100%)`;
        
        // Update productivity message
        if (percentage === 0) {
            productivityMessage.textContent = "Let's get started!";
        } else if (percentage < 30) {
            productivityMessage.textContent = "You can do better!";
        } else if (percentage < 70) {
            productivityMessage.textContent = "Good progress!";
        } else if (percentage < 100) {
            productivityMessage.textContent = "Almost there!";
        } else {
            productivityMessage.textContent = "Perfect! All tasks completed!";
        }
    }

    // Calendar functions
    function renderCalendar() {
        calendarGrid.innerHTML = '';
        
        currentMonthYear.textContent = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });
        
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const today = new Date();
        
        // Day headers
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        daysOfWeek.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });
        
        // Empty cells for days before first day
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day other-month';
            calendarGrid.appendChild(emptyDay);
        }
        
        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            const dateStr = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
            const hasTasks = tasks.some(task => {
                const taskDate = new Date(task.completed ? task.completedDate : task.date);
                return taskDate.toISOString().split('T')[0] === dateStr;
            });
            
            if (hasTasks) dayElement.classList.add('has-tasks');
            
            if (day === today.getDate() && 
                currentMonth === today.getMonth() && 
                currentYear === today.getFullYear()) {
                dayElement.classList.add('today');
            }
            
            calendarGrid.appendChild(dayElement);
        }
    }

    function showPreviousMonth() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    }

    function showNextMonth() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    }

    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('pokemon-tasks', JSON.stringify(tasks));
    }

    // Initialize the application
    init();
});
