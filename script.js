// --- CONSTANTS AND INITIALIZATION ---
const STORAGE_KEY = 'dynamicTaskManagerTasks';
const PRIORITY_ORDER = { 'High': 3, 'Medium': 2, 'Low': 1 };

let tasks = [];

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const prioritySelect = document.getElementById('priority-select');
const taskList = document.getElementById('task-list');
const sortSelect = document.getElementById('sort-select');
const filterSelect = document.getElementById('filter-select');
const noTasksMessage = document.getElementById('no-tasks-message');

// --- LOCAL STORAGE HANDLING ---

/**
 * Loads tasks from local storage.
 * @returns {Array} The array of tasks or an empty array.
 */
const loadTasks = () => {
    try {
        const storedTasks = localStorage.getItem(STORAGE_KEY);
        tasks = storedTasks ? JSON.parse(storedTasks) : [];
    } catch (error) {
        console.error("Error loading from Local Storage:", error);
        tasks = [];
    }
};

/**
 * Saves the current tasks array to local storage.
 */
const saveTasks = () => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        console.error("Error saving to Local Storage:", error);
    }
};

// --- CORE LOGIC: TASK MANAGEMENT ---

/**
 * Adds a new task to the list.
 * @param {string} text - The task description.
 * @param {string} priority - The task priority ('High', 'Medium', 'Low').
 */
const addTask = (text, priority) => {
    const newTask = {
        id: Date.now(), // Use timestamp as a simple unique ID
        text: text.trim(),
        priority: priority,
        completed: false,
        timestamp: Date.now()
    };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
};

/**
 * Toggles the 'completed' status of a task.
 * @param {number} id - The ID of the task to toggle.
 */
const toggleTaskCompletion = (id) => {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex > -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks();
        renderTasks(); // Re-render to apply completed styles
    }
};

/**
 * Deletes a task from the list.
 * @param {number} id - The ID of the task to delete.
 */
const deleteTask = (id) => {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
};

// --- SORTING AND FILTERING ---

/**
 * Gets the currently filtered and sorted list of tasks.
 * @returns {Array} The processed task list.
 */
const getProcessedTasks = () => {
    const filterValue = filterSelect.value;
    const sortValue = sortSelect.value;

    // 1. Filtering
    let filteredTasks = tasks.filter(task => {
        if (filterValue === 'all') return true;
        return task.priority === filterValue;
    });

    // 2. Sorting
    filteredTasks.sort((a, b) => {
        // Secondary sort: keep completed tasks at the bottom
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;

        if (sortValue === 'latest') {
            // Sort by newest first
            return b.timestamp - a.timestamp;
        } else {
            const priorityA = PRIORITY_ORDER[a.priority];
            const priorityB = PRIORITY_ORDER[b.priority];

            if (sortValue === 'priority-desc') {
                // High to Low (Descending)
                return priorityB - priorityA;
            } else if (sortValue === 'priority-asc') {
                // Low to High (Ascending)
                return priorityA - priorityB;
            }
        }
        return 0;
    });

    return filteredTasks;
};


// --- RENDERING ---

/**
 * Renders the filtered and sorted tasks to the DOM.
 */
const renderTasks = () => {
    const processedTasks = getProcessedTasks();
    taskList.innerHTML = '';

    if (processedTasks.length === 0) {
        noTasksMessage.classList.remove('hidden');
        return;
    } else {
        noTasksMessage.classList.add('hidden');
    }

    processedTasks.forEach(task => {
        const taskElement = document.createElement('div');
        const completionClass = task.completed ? 'task-completed' : '';
        const priorityClass = `priority-${task.priority.toLowerCase()}`;
        const checked = task.completed ? 'checked' : '';

        taskElement.className = `flex items-center justify-between p-4 rounded-xl shadow-sm transition duration-150 ease-in-out ${priorityClass} ${completionClass}`;

        taskElement.innerHTML = `
            <div class="flex items-center space-x-4 flex-grow min-w-0">
                <input type="checkbox" id="task-${task.id}" ${checked}
                       class="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                       data-id="${task.id}">
                <label for="task-${task.id}" class="text-base font-medium truncate flex-grow">
                    ${task.text}
                </label>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full 
                    ${task.priority === 'High' ? 'bg-red-200 text-red-800' :
                task.priority === 'Medium' ? 'bg-amber-200 text-amber-800' :
                    'bg-green-200 text-green-800'}
                    hidden sm:inline-block">
                    ${task.priority}
                </span>
            </div>
            <button class="delete-btn text-gray-400 hover:text-red-600 transition duration-150 ml-4 p-1 rounded-full hover:bg-red-100"
                    data-id="${task.id}">
                <!-- Icon: Trash -->
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m14 0H5m4 0V3a1 1 0 00-1-1H8a1 1 0 00-1 1v4m7 0V3a1 1 0 00-1-1h-2a1 1 0 00-1 1v4"></path></svg>
            </button>
        `;

        taskList.appendChild(taskElement);
    });
};

// --- EVENT LISTENERS ---

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput.value;
    const priority = prioritySelect.value;

    if (text) {
        addTask(text, priority);
        taskInput.value = ''; // Clear input
        prioritySelect.value = 'Medium'; // Reset priority
    }
});

taskList.addEventListener('click', (e) => {
    const target = e.target;

    // Handle Toggle Completion (Checkbox or Label click)
    const checkbox = target.closest('input[type="checkbox"]');
    if (checkbox) {
        const id = parseInt(checkbox.dataset.id);
        toggleTaskCompletion(id);
        return;
    }

    // Handle Delete Button
    const deleteBtn = target.closest('.delete-btn');
    if (deleteBtn) {
        const id = parseInt(deleteBtn.dataset.id);
        // Simple confirmation without alert()
        if (confirm('Are you sure you want to delete this task?')) {
            deleteTask(id);
        }
    }
});

// Event listeners for sorting and filtering changes
sortSelect.addEventListener('change', renderTasks);
filterSelect.addEventListener('change', renderTasks);

// --- INITIAL SETUP ---
loadTasks();
renderTasks();

// Simple confirmation replacement for alert/confirm
function confirm(message) {
    return window.confirm(message);
}
