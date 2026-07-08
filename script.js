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
const segmentIndicator = document.querySelector('.segment-indicator');
const clearAllBtn = document.getElementById('clearAllBtn');
const addFab = document.getElementById('addFab');
const upcomingList = document.getElementById('upcomingList');
const upcomingSection = document.getElementById('upcomingSection');

const categoryStyles = {
    All: { icon: '•', class: 'category-all' },
    Personal: { icon: '☀', class: 'category-personal' },
    Work: { icon: '⚙', class: 'category-work' },
    Health: { icon: '🍃', class: 'category-health' },
    Shopping: { icon: '🛍', class: 'category-shopping' }
};

// Settings elements
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const darkModeToggle = document.getElementById('darkModeToggle');
const changeNameSettingsBtn = document.getElementById('changeNameSettingsBtn');
const greetingText = document.getElementById('greetingText');
const completionPercentageLabel = document.getElementById('completionPercentage');
let progressCircle = null;
const progressRadius = 18;
const progressCircumference = 2 * Math.PI * progressRadius;

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
    progressCircle = document.querySelector('.progress-ring__circle');
    
    if (!userNameStored) {
        welcomeModal.classList.remove('hidden');
        nameInput.focus();
    } else {
        welcomeModal.classList.add('hidden');
        userName.textContent = userNameStored;
    }
    
    loadTodos();
    loadDarkMode();
    updateGreeting();
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

addFab.addEventListener('click', () => {
    todoInput.focus();
    todoInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

categoryFilter.forEach(btn => {
    const category = btn.dataset.category;
    const style = categoryStyles[category];
    if (style) {
        btn.dataset.icon = style.icon;
        btn.classList.add(style.class);
    }

    btn.addEventListener('click', function() {
        setActiveFilter(this.dataset.category);
        renderTodos();
    });
});

function setActiveFilter(category) {
    currentFilter = category;
    categoryFilter.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
    updateFilterIndicator();
}

function getCategoryCounts() {
    return todos.reduce((counts, todo) => {
        counts.All += 1;
        counts[todo.category] = (counts[todo.category] || 0) + 1;
        return counts;
    }, { All: 0, Personal: 0, Work: 0, Health: 0, Shopping: 0 });
}

function updateCategoryCounts() {
    const counts = getCategoryCounts();
    categoryFilter.forEach(btn => {
        const badge = btn.querySelector('.count-badge');
        if (badge) {
            badge.textContent = counts[btn.dataset.category] || 0;
        }
    });
}

function updateFilterIndicator() {
    if (!segmentIndicator) return;
    const active = document.querySelector('.category-btn.active');
    const wrapper = active?.closest('.category-filter');
    if (!active || !wrapper) return;
    const activeRect = active.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    const left = activeRect.left - wrapperRect.left;
    segmentIndicator.style.width = `${activeRect.width}px`;
    segmentIndicator.style.transform = `translateX(${left}px)`;
}

function fadeListsIn() {
    requestAnimationFrame(() => {
        todoList.style.opacity = '1';
        upcomingList.style.opacity = '1';
    });
}

function isSameDate(value, compareDate) {
    const date = new Date(value);
    return date.getFullYear() === compareDate.getFullYear() && date.getMonth() === compareDate.getMonth() && date.getDate() === compareDate.getDate();
}

function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getUpcomingLabel(dateValue) {
    const date = startOfDay(new Date(dateValue));
    const today = startOfDay(new Date());
    const diff = Math.round((date - today) / (1000 * 60 * 60 * 24));

    if (diff === 1) return 'Tomorrow';
    if (diff >= 2 && diff <= 6) {
        return `This ${date.toLocaleDateString('en-US', { weekday: 'long' })}`;
    }
    if (diff >= 7 && diff <= 13) return 'Next week';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function groupByDate(tasks) {
    const groups = [];
    const map = new Map();

    tasks.forEach(task => {
        const key = task.dueDate;
        if (!map.has(key)) {
            map.set(key, { label: getUpcomingLabel(key), tasks: [] });
        }
        map.get(key).tasks.push(task);
    });

    map.forEach((group, key) => {
        groups.push({ date: new Date(key), label: group.label, tasks: group.tasks });
    });

    return groups.sort((a, b) => a.date - b.date);
}

function formatDueDateLabel(value) {
    const date = new Date(value);
    const today = startOfDay(new Date());
    const target = startOfDay(date);
    const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));

    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

clearAllBtn.addEventListener('click', clearCompleted);

// Settings event listeners
settingsBtn.addEventListener('click', openSettings);
closeSettingsBtn.addEventListener('click', closeSettings);
darkModeToggle.addEventListener('change', toggleDarkMode);

saveEditBtn.addEventListener('click', saveEdit);
cancelEditBtn.addEventListener('click', closeEditModal);
window.addEventListener('resize', updateFilterIndicator);

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
    updateGreeting();
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
    updateGreeting();
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
    updateCategoryCounts();
    updateFilterIndicator();

    // Fade the list out before updating
    todoList.style.transition = 'opacity 180ms ease';
    upcomingList.style.transition = 'opacity 180ms ease';
    todoList.style.opacity = '0';
    upcomingList.style.opacity = '0';

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

    const tasksWithoutDates = filtered.filter(t => !t.dueDate);
    const datedTasks = filtered
        .filter(t => t.dueDate)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    const todayTasks = datedTasks.filter(t => isSameDate(t.dueDate, new Date()));
    const upcomingTasks = datedTasks.filter(t => !isSameDate(t.dueDate, new Date()));

    if (tasksWithoutDates.length === 0 && todayTasks.length === 0 && upcomingTasks.length === 0) {
        todoList.innerHTML = '<li class="empty-state">No tasks yet. Add one to get started!</li>';
        upcomingSection.style.display = 'none';
        updateCounter();
        fadeListsIn();
        return;
    }

    if (tasksWithoutDates.length > 0 || todayTasks.length > 0) {
        const mainTasks = [...tasksWithoutDates, ...todayTasks];
        mainTasks.forEach(todo => todoList.appendChild(createTodoElement(todo)));
    } else {
        todoList.innerHTML = '<li class="empty-state">No tasks for today.</li>';
    }

    if (upcomingTasks.length > 0) {
        upcomingSection.style.display = 'block';
        const grouped = groupByDate(upcomingTasks);
        grouped.forEach(group => {
            const groupWrapper = document.createElement('div');
            groupWrapper.className = 'upcoming-group';

            const heading = document.createElement('h4');
            heading.className = 'group-label';
            heading.textContent = group.label;
            groupWrapper.appendChild(heading);

            const groupList = document.createElement('ul');
            groupList.className = 'todo-list group-list';
            group.tasks.forEach(todo => groupList.appendChild(createTodoElement(todo)));
            groupWrapper.appendChild(groupList);

            upcomingList.appendChild(groupWrapper);
        });
    } else {
        upcomingSection.style.display = 'none';
    }

    updateCounter();
    fadeListsIn();
    playCompletionEffects();
}

function createTodoElement(todo) {
    const categoryStyle = categoryStyles[todo.category] || categoryStyles.All;
    const li = document.createElement('li');
    li.className = `todo-item ${categoryStyle.class}`;
    li.dataset.todoId = todo.id;
    if (todo.completed) li.classList.add('completed');

    const dueDateStr = todo.dueDate ? formatDueDateLabel(todo.dueDate) : '';

    li.innerHTML = `
        <label class="task-toggle">
            <input 
                type="checkbox" 
                class="todo-checkbox"
                ${todo.completed ? 'checked' : ''}
                onchange="toggleComplete(${todo.id})"
            >
            <span class="custom-checkbox" aria-hidden="true">
                <svg viewBox="0 0 18 18" class="checkmark" aria-hidden="true">
                    <path d="M4.5 9.5l3.25 3.25 6.75-6.75" />
                </svg>
            </span>
        </label>
        <div class="todo-content">
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <div class="todo-meta">
                <span class="todo-category ${categoryStyle.class}" data-icon="${categoryStyle.icon}">${todo.category}</span>
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

let pendingCompletionCelebration = null;

function toggleComplete(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const isCompleting = !todo.completed;
    const remainingSameCategory = todos.some(t => t.id !== id && !t.completed && t.category === todo.category);
    const remainingAny = todos.some(t => t.id !== id && !t.completed);

    todo.completed = !todo.completed;
    saveTodos();
    renderTodos();

    if (isCompleting) {
        const level = !remainingAny ? 'all' : (!remainingSameCategory ? 'category' : null);
        if (level) {
            pendingCompletionCelebration = { id, level };
        }
    }
}

function playCompletionEffects() {
    if (!pendingCompletionCelebration) return;
    const { id, level } = pendingCompletionCelebration;
    pendingCompletionCelebration = null;

    if (prefersReducedMotion()) return;

    const completedRow = document.querySelector(`.todo-item[data-todo-id="${id}"]`);
    if (completedRow) {
        completedRow.classList.add('animate-complete');
        triggerCelebrationBurst(completedRow, level);
        window.setTimeout(() => completedRow.classList.remove('animate-complete'), 300);
    }
}

function triggerCelebrationBurst(container, level) {
    const burst = document.createElement('div');
    burst.className = `confetti-burst confetti-${level}`;

    for (let i = 0; i < 6; i += 1) {
        const dot = document.createElement('span');
        dot.className = 'confetti-piece';
        dot.style.setProperty('--confetti-angle', `${30 + i * 20}deg`);
        dot.style.setProperty('--confetti-delay', `${i * 25}ms`);
        burst.appendChild(dot);
    }

    container.appendChild(burst);
    window.setTimeout(() => burst.remove(), 700);
}

function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

function confirmChangeName() {
    const name = newNameInput.value.trim();
    
    if (name === '') {
        alert('Please enter your name!');
        return;
    }
    
    userNameStored = name;
    userName.textContent = name;
    saveUserName();
    updateGreeting();
    closeChangeNameModal();
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
    updateProgress();
}

function getTimeOfDayGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

function updateGreeting() {
    if (!greetingText) return;
    const name = userNameStored || 'Guest';
    greetingText.textContent = `${getTimeOfDayGreeting()}, ${name}`;
}

function updateProgress() {
    if (!completionPercentageLabel) return;
    const total = todos.length;
    const done = todos.filter(t => t.completed).length;
    const percentage = total ? Math.round((done / total) * 100) : 0;
    completionPercentageLabel.textContent = `${percentage}%`;

    if (progressCircle) {
        progressCircle.style.strokeDasharray = `${progressCircumference} ${progressCircumference}`;
        progressCircle.style.strokeDashoffset = `${progressCircumference * (1 - percentage / 100)}`;
    }
}

function applyTheme(theme) {
    document.body.classList.toggle('dark-mode', theme === 'dark');
    document.body.classList.toggle('light-mode', theme === 'light');
    darkModeToggle.checked = theme === 'dark';
}

function toggleDarkMode() {
    const theme = darkModeToggle.checked ? 'dark' : 'light';
    applyTheme(theme);
    localStorage.setItem('theme', theme);
}

function getPreferredTheme() {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
        return storedTheme;
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }

    return 'light';
}

function loadDarkMode() {
    const theme = getPreferredTheme();
    applyTheme(theme);
}

if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        if (!localStorage.getItem('theme')) {
            applyTheme(event.matches ? 'dark' : 'light');
        }
    });
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
