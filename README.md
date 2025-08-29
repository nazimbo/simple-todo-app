# Simple Todo App

A modern, accessible todo application built with vanilla JavaScript, HTML, and CSS. Features a clean interface, dark mode, drag-and-drop reordering, keyboard navigation, and robust data validation.

## Features

### Core Functionality
- ✅ Add, complete, and delete todo items
- 🔄 Drag-and-drop reordering (mouse and touch support)
- 💾 Persistent storage with localStorage fallback
- 🎯 Input validation and sanitization (XSS protection)
- 📝 Character limit (100 characters) with live counter

### User Experience
- 🌓 Dark mode toggle with system preference detection
- 🌍 Internationalization support (English/French)
- 📱 Responsive design for all screen sizes
- ⚡ Smooth animations and transitions
- 🎨 Modern design with CSS custom properties

### Accessibility Features
- ♿ Full keyboard navigation support
- 🔊 Screen reader announcements (ARIA live regions)
- 🎯 ARIA labels and semantic HTML
- ⌨️ Keyboard shortcuts (Ctrl+/ for input, Ctrl+L for todos)
- 🎛️ Arrow key navigation between todo items

## Quick Start

### Running the Application
1. Clone or download the project files
2. Open `index.html` in any modern web browser
3. Start adding todos!

No build process or dependencies required - this is a pure vanilla JavaScript application.

### Browser Compatibility
- Chrome 60+ ✅
- Firefox 55+ ✅
- Safari 12+ ✅
- Edge 79+ ✅

## File Structure

```
simple-todo-app/
├── index.html          # Main HTML structure
├── script.js           # Application logic and functionality
├── style.css           # Styling with CSS custom properties
└── README.md           # This file
```

## Usage

### Basic Operations
- **Add Todo**: Type in the input field and press Enter or click "Add Task"
- **Complete Todo**: Click the "Complete" button or press Enter/Space when focused
- **Delete Todo**: Click the "Delete" button or press Delete/Backspace when focused
- **Reorder**: Drag todos to new positions or use Ctrl+Arrow keys

### Keyboard Shortcuts
- `Ctrl + /` - Focus input field
- `Ctrl + L` - Focus first todo item
- `Arrow Up/Down` - Navigate between todos
- `Home/End` - Jump to first/last todo
- `Enter/Space` - Toggle completion status
- `Delete/Backspace` - Delete todo
- `Ctrl + Arrow Up/Down` - Move todo up/down

### Dark Mode
Click the moon/sun icon in the top-right corner to toggle dark mode. The app respects your system's dark mode preference by default.

## Architecture

### Data Flow
1. **Input Validation**: All user input is sanitized to prevent XSS attacks
2. **State Management**: Todos stored in memory array, synced with localStorage
3. **Rendering**: DOM updates triggered by state changes
4. **Persistence**: Automatic saving to localStorage with error handling

### Storage Strategy
- Primary: localStorage for persistent storage
- Fallback: In-memory storage when localStorage unavailable
- Validation: All stored data validated and sanitized on load
- Error Recovery: Corrupted data automatically cleaned or reset

### Security Features
- HTML tag stripping from user input
- Control character removal
- Duplicate prevention
- Input length validation
- Safe DOM manipulation (textContent over innerHTML)

## Development

### Code Style
- Modern ES6+ JavaScript
- Semantic HTML5 structure
- CSS custom properties for theming
- Mobile-first responsive design
- Accessibility-first approach

### Key Functions
- `loadTodos()` - Safe data loading with validation
- `validateTodo()` - Input sanitization and validation
- `renderTodos()` - DOM rendering with accessibility
- `saveTodos()` - Error-handling storage operations

## Contributing

When contributing to this project:
1. Maintain the existing code style and patterns
2. Ensure all new features are accessible
3. Test on multiple browsers and devices
4. Validate that security measures remain intact
5. Update documentation for new features

## License

This project is open source and available under the MIT License.