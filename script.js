// ===== DOM ELEMENTS =====
const todoInput = document.getElementById('todoInput');
const categorySelect = document.getElementById('categorySelect');
const dueDateInput = document.getElementById('dueDateInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const totalCount = document.getElementById('totalCount');
const doneCount = document.getElementById('doneCount');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.querySelectorAll('.category-btn');
const clearAllBtn = document.getElementById('clearAllBtn');
const upcomingList = document.getElementById('upcomingList');
const upcomingSection = document.getElementById('upcomingSection');

// Settings elements
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const darkModeToggle = document.getElementById('darkModeToggle');
const changeNameSettingsBtn = document.getElementById('changeNameSettingsBtn');

// Welcome modal elements
const welcomeModal = document.getElementById('welcomeModal');
const nameInput = document.getElementById('nameInput');
const startBtn = document.getElementById('startBtn');
const userName = document.getElementById('userName');

// Change name modal elements
const changeNameModal = document.getElementById('changeNameModal');
const newNameInput = document.getElementById('newNameInput');
const confirmNameBtn = document.getElementById('confirmNameBtn');
const cancelNameBtn = document.getElementById('cancelNameBtn');

// Modal elements
const editModal = document.getElementById('editModal');
const editTaskText = document.getElementById('editTaskText');
const editCategory = document.getElementById('editCategory');
const editDueDate = document.getElementById('editDueDate');
const saveEditBtn = document.getElementById('saveEditBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// ===== STATE =====
let todos = [];
let currentFilter = 'All';
let editingId = null;
let userNameStored = null;

// ===== INITIALIZATION =====
window.addEventListener('DOMContentLoaded', function() {
    loadUserName();
    
    if (!userNameStored) {
        welcomeModal.classList.remove('hidden');
        nameInput.focus();
    } else {
        welcomeModal.classList.add('hidden');
        userName.textContent = userNameStored;
    }
    
    loadTodos();
    loadDarkMode();
    renderTodos();
});

// ===== EVENT LISTENERS =====
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') addTodo();
});

nameInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') setUserName();
});

startBtn.addEventListener('click', setUserName);
changeNameSettingsBtn.addEventListener('click', openChangeNameModal);
confirmNameBtn.addEventListener('click', confirmChangeName);
cancelNameBtn.addEventListener('click', closeChangeNameModal);

searchInput.addEventListener('input', renderTodos);

categoryFilter.forEach(btn => {
    btn.addEventListener('click', function() {
        categoryFilter.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.category;
        renderTodos();
    });
});

clearAllBtn.addEventListener('click', clearCompleted);

// Settings event listeners
settingsBtn.addEventListener('click', openSettings);
closeSettingsBtn.addEventListener('click', closeSettings);
darkModeToggle.addEventListener('change', toggleDarkMode);

saveEditBtn.addEventListener('click', saveEdit);
cancelEditBtn.addEventListener('click', closeEditModal);

// ===== NAME MANAGEMENT =====

function setUserName() {
    const name = nameInput.value.trim();
    
    if (name === '') {
        alert('Please enter your name!');
        return;
    }
    
    userNameStored = name;
    userName.textContent = name;
    saveUserName();
    welcomeModal.classList.add('hidden');
    todoInput.focus();
}

function openChangeNameModal() {
    closeSettings();
    newNameInput.value = userNameStored || '';
    changeNameModal.classList.remove('hidden');
    newNameInput.focus();
}

function closeChangeNameModal() {
    changeNameModal.classList.add('hidden');
}

function confirmChangeName() {
    const name = newNameInput.value.trim();
    
    if (name === '') {
        alert('Please enter your name!');
        return;
    }
    
    userNameStored = name;
    userName.textContent = name;
    saveUserName();
    closeChangeNameModal();
}

// ===== SETTINGS MANAGEMENT =====

function openSettings() {
    settingsModal.classList.remove('hidden');
    darkModeToggle.checked = document.body.classList.contains('dark-mode');
}

function closeSettings() {
    settingsModal.classList.add('hidden');
}

// ===== MAIN FUNCTIONS =====

function addTodo() {
    const text = todoInput.value.trim();
    const category = categorySelect.value;
    const dueDate = dueDateInput.value;

    if (text === '') {
        alert('Please enter a task!');
        return;
    }

    const newTodo = {
        id: Date.now(),
        text: text,
        category: category,
        dueDate: dueDate,
        completed: false,
        dateAdded: new Date().toISOString()
    };

    todos.push(newTodo);
    saveTodos();
    renderTodos();

    // Clear inputs
    todoInput.value = '';
    dueDateInput.value = '';
    categorySelect.value = 'Personal';
    todoInput.focus();
}

function renderTodos() {
    // Clear both lists
    todoList.innerHTML = '';
    upcomingList.innerHTML = '';

    // Filter todos based on search and category
    const searchTerm = searchInput.value.toLowerCase();
    const filtered = todos.filter(todo => {
        const matchesSearch = todo.text.toLowerCase().includes(searchTerm);
        const matchesCategory = currentFilter === 'All' || todo.category === currentFilter;
        return matchesSearch && matchesCategory;
    });

    // Split into tasks with dates and without dates
    const tasksWithoutDates = filtered.filter(t => !t.dueDate);
    const tasksWithDates = filtered.filter(t => t.dueDate);

    // Render tasks without dates
    if (tasksWithoutDates.length === 0 && tasksWithDates.length === 0) {
        todoList.innerHTML = '<li class="empty-state">No tasks yet. Add one to get started!</li>';
        upcomingSection.style.display = 'none';
        updateCounter();
        return;
    }

    if (tasksWithoutDates.length > 0) {
        tasksWithoutDates.forEach(todo => {
            todoList.appendChild(createTodoElement(todo));
        });
    } else if (tasksWithDates.length > 0) {
        todoList.innerHTML = '<li class="empty-state">No tasks for today</li>';
    }

    // Render tasks with dates
    if (tasksWithDates.length > 0) {
        upcomingSection.style.display = 'block';
        tasksWithDates.forEach(todo => {
            upcomingList.appendChild(createTodoElement(todo));
        });
    } else {
        upcomingSection.style.display = 'none';
    }

    updateCounter();
}

function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    if (todo.completed) li.classList.add('completed');

    const dueDateStr = todo.dueDate 
        ? new Date(todo.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '';

    li.innerHTML = `
        <input 
            type="checkbox" 
            class="todo-checkbox"
            ${todo.completed ? 'checked' : ''}
            onchange="toggleComplete(${todo.id})"
        >
        <div class="todo-content">
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <div class="todo-meta">
                <span class="todo-category">${todo.category}</span>
                ${todo.dueDate ? `<span class="todo-date">${dueDateStr}</span>` : ''}
            </div>
        </div>
        <div class="todo-actions">
            <button class="edit-btn" onclick="openEditModal(${todo.id})">Edit</button>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
        </div>
    `;

    return li;
}

function toggleComplete(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

function deleteTodo(id) {
    if (!confirm('Delete this task?')) return;
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
}

function openEditModal(id) {
    editingId = id;
    const todo = todos.find(t => t.id === id);
    if (todo) {
        editTaskText.value = todo.text;
        editCategory.value = todo.category;
        editDueDate.value = todo.dueDate || '';
        editModal.classList.remove('hidden');
        editTaskText.focus();
    }
}

function closeEditModal() {
    editModal.classList.add('hidden');
    editingId = null;
}

function saveEdit() {
    if (!editingId) return;

    const text = editTaskText.value.trim();
    if (text === '') {
        alert('Task cannot be empty!');
        return;
    }

    const todo = todos.find(t => t.id === editingId);
    if (todo) {
        todo.text = text;
        todo.category = editCategory.value;
        todo.dueDate = editDueDate.value;
        saveTodos();
        renderTodos();
        closeEditModal();
    }
}

function clearCompleted() {
    const completed = todos.filter(t => t.completed).length;
    if (completed === 0) {
        alert('No completed tasks to clear!');
        return;
    }

    if (!confirm('Are you sure you want to delete all your completed tasks?')) return;

    todos = todos.filter(t => !t.completed);
    saveTodos();
    renderTodos();
}

function updateCounter() {
    const total = todos.length;
    const done = todos.filter(t => t.completed).length;
    totalCount.textContent = total;
    doneCount.textContent = done;
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// ===== STORAGE =====

function saveTodos() {
    const json = JSON.stringify(todos);
    localStorage.setItem('todos', json);
}

function loadTodos() {
    const json = localStorage.getItem('todos');
    if (json) {
        todos = JSON.parse(json);
    } else {
        todos = [];
    }
}

function saveUserName() {
    localStorage.setItem('userName', userNameStored);
}

function loadUserName() {
    userNameStored = localStorage.getItem('userName');
}

function loadDarkMode() {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
}

// ===== UTILITY =====

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
