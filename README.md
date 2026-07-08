# To-Do List Web App

A simple, interactive to-do list application built with vanilla HTML, CSS, and JavaScript.

## Features

✅ Add new tasks
✅ Mark tasks as complete (with strikethrough)
✅ Delete tasks with confirmation
✅ Persist data in browser storage (survives page refresh)
✅ View total and completed task count
✅ Clean, modern UI with gradient background

## How to Use

1. **Open the app**: Double-click `index.html` or right-click → "Open with Browser"
2. **Add a task**: Type in the input field and click "Add" or press Enter
3. **Complete a task**: Click the checkbox next to a task
4. **Delete a task**: Click the "Delete" button
5. **Data persists**: Close and reopen the page - your tasks are still there!

## File Structure

```
index.html  → The page structure (what you see)
styles.css  → The styling (colors, layout, fonts)
script.js   → The functionality (what makes it work)
```

## How It Works

### HTML (index.html)
- Defines the structure of the page
- Creates the input field, button, and list where todos appear

### CSS (styles.css)
- Makes the app look nice with colors, spacing, and animations
- Uses flexbox for layout
- Gradient background, rounded corners, shadows

### JavaScript (script.js)
- Handles user interactions (clicks, key presses)
- Manages the todos array
- Renders todos to the page
- Saves todos to localStorage
- Loads todos when the page opens

## Key Concepts Explained

### localStorage
- Browser storage that persists even after the page is closed
- Data is stored as strings, so we use `JSON.stringify()` and `JSON.parse()`
- Limited to ~5-10MB per domain

### DOM Manipulation
- `document.getElementById()` - Find elements in the page
- `innerHTML` - Change the HTML inside an element
- `addEventListener()` - Listen for user actions
- `classList.add()` - Add CSS classes to elements

### Events
- `click` - When user clicks a button
- `keypress` - When user presses a key
- `change` - When user interacts with a checkbox
- `DOMContentLoaded` - When the page finishes loading

### Array Methods
- `.push()` - Add items to an array
- `.filter()` - Remove items from an array
- `.find()` - Search for an item in an array
- `.forEach()` - Loop through each item

## Future Improvements (Learning Challenges)

1. Add edit functionality (edit an existing todo)
2. Add due dates
3. Add categories/tags
4. Add localStorage clearing button
5. Add dark mode toggle
6. Add local notifications
7. Add drag-and-drop to reorder tasks

## Browser Support

Works in all modern browsers:
- Chrome, Firefox, Safari, Edge (latest versions)
- Requires localStorage support (available in all modern browsers)

---

**Created**: June 2026
**Technology**: Vanilla JavaScript (No frameworks)
**Difficulty Level**: Beginner
