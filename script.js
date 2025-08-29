/**
 * Language translations for internationalization support
 * Currently supports English (en) and French (fr)
 */
// Language translations
const translations = {
    en: {
      appTitle: "Todo App",
      addTask: "Add Task",
      enterTask: "Enter a new task",
      complete: "Complete",
      undo: "Undo",
      delete: "Delete",
    },
    fr: {
      appTitle: "Liste de Tâches",
      addTask: "Ajouter une Tâche",
      enterTask: "Entrez une nouvelle tâche",
      complete: "Terminer",
      undo: "Annuler",
      delete: "Supprimer",
    },
  };
  
  /**
   * Determine user's language preference from browser settings
   * Falls back to English if the detected language is not supported
   */
  // Determine user's language preference
  const userLang = navigator.language.split("-")[0]; // Get the language code (e.g., 'en' from 'en-US')
  const lang = ["en", "fr"].includes(userLang) ? userLang : "en"; // Default to English if not supported
  
  /**
   * Get translated text for a given key
   * @param {string} key - The translation key to look up
   * @returns {string} The translated text in the current language
   */
  // Function to get translated text
  const t = (key) => translations[lang][key];
  
  // Select DOM elements
  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  const charCount = document.getElementById("char-count");
  const todoList = document.getElementById("todo-list");
  const darkModeToggle = document.getElementById("dark-mode-toggle"); // Dark mode toggle button
  const MAX_CHARS = 100;
  
  // Apply translations to static elements
  document.getElementById("app-title").textContent = t("appTitle");
  document.getElementById("add-button").textContent = t("addTask");
  input.placeholder = t("enterTask");
  
  // Initialize todos array from localStorage or empty array if not present
  let todos = [];
  
  /**
   * Check if localStorage is available and functional
   * Some browsers or privacy modes may disable localStorage
   * @returns {boolean} True if localStorage is available, false otherwise
   */
  // Check if localStorage is available
  const isLocalStorageAvailable = () => {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  // In-memory fallback storage when localStorage is unavailable
  let memoryStorage = {};
  
  /**
   * Safe storage wrapper that falls back to memory storage
   * Provides a consistent API whether localStorage is available or not
   */
  // Safe storage wrapper that falls back to memory storage
  const safeStorage = {
    getItem: (key) => {
      if (isLocalStorageAvailable()) {
        return localStorage.getItem(key);
      }
      return memoryStorage[key] || null;
    },
    setItem: (key, value) => {
      if (isLocalStorageAvailable()) {
        localStorage.setItem(key, value);
      } else {
        memoryStorage[key] = value;
      }
    },
    removeItem: (key) => {
      if (isLocalStorageAvailable()) {
        localStorage.removeItem(key);
      } else {
        delete memoryStorage[key];
      }
    }
  };
  
  /**
   * Validate and sanitize a single todo object
   * Removes HTML tags, control characters, and enforces length limits
   * @param {Object} todo - The todo object to validate
   * @param {string} todo.text - The todo text content
   * @param {boolean} todo.completed - The completion status
   * @returns {Object|null} Sanitized todo object or null if invalid
   */
  // Validate and sanitize a single todo object
  const validateTodo = (todo) => {
    if (!todo || typeof todo !== 'object' || todo === null) {
      return null;
    }
    
    // Validate required properties
    if (typeof todo.text !== 'string' || typeof todo.completed !== 'boolean') {
      return null;
    }
    
    // Sanitize text content to prevent XSS
    let sanitizedText = todo.text;
    
    // Remove any HTML tags and scripts
    sanitizedText = sanitizedText.replace(/<[^>]*>/g, '');
    
    // Remove null bytes and control characters
    sanitizedText = sanitizedText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // Trim and validate length
    sanitizedText = sanitizedText.trim();
    if (sanitizedText.length === 0 || sanitizedText.length > MAX_CHARS) {
      return null;
    }
    
    return {
      text: sanitizedText,
      completed: Boolean(todo.completed)
    };
  };
  
  /**
   * Safe function to load todos from storage
   * Validates and sanitizes all loaded data, handles corrupted data gracefully
   * @returns {Array<Object>} Array of validated todo objects
   */
  // Safe function to load todos from storage
  const loadTodos = () => {
    try {
      const storedTodos = safeStorage.getItem("todos");
      if (!storedTodos) {
        return [];
      }
      
      // Validate the stored data format before parsing
      if (typeof storedTodos !== 'string') {
        console.warn("Invalid todos data format in storage");
        safeStorage.removeItem("todos");
        return [];
      }
      
      // Check for basic JSON structure before parsing
      if (!storedTodos.trim().startsWith('[') || !storedTodos.trim().endsWith(']')) {
        console.warn("Invalid todos JSON structure in storage");
        safeStorage.removeItem("todos");
        return [];
      }
      
      let parsed;
      try {
        parsed = JSON.parse(storedTodos);
      } catch (parseError) {
        console.error("JSON parsing failed for todos:", parseError);
        safeStorage.removeItem("todos");
        return [];
      }
      
      // Validate that parsed data is an array
      if (!Array.isArray(parsed)) {
        console.warn("Todos data is not an array");
        safeStorage.removeItem("todos");
        return [];
      }
      
      // Validate and sanitize each todo item
      const validTodos = [];
      for (const todo of parsed) {
        const validatedTodo = validateTodo(todo);
        if (validatedTodo) {
          validTodos.push(validatedTodo);
        }
      }
      
      // If we filtered out items, save the cleaned data back
      if (validTodos.length !== parsed.length) {
        console.warn(`Filtered out ${parsed.length - validTodos.length} invalid todos`);
        try {
          safeStorage.setItem("todos", JSON.stringify(validTodos));
        } catch (saveError) {
          console.error("Failed to save cleaned todos:", saveError);
        }
      }
      
      return validTodos;
      
    } catch (error) {
      console.error("Failed to load todos from storage:", error);
      // Clear potentially corrupted data
      try {
        safeStorage.removeItem("todos");
      } catch (clearError) {
        console.error("Failed to clear corrupted todos:", clearError);
      }
      return [];
    }
  };
  
  todos = loadTodos();
  
  // **Dark mode functionality**
  // Check if dark mode preference is set in localStorage or matches system preferences
  const isSystemDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches; // System dark mode preference
  let isDarkMode = false;
  
  try {
    const darkModePreference = safeStorage.getItem("darkMode");
    isDarkMode = darkModePreference === "true" || (!darkModePreference && isSystemDarkMode);
  } catch (error) {
    console.error("Failed to load dark mode preference:", error);
    isDarkMode = isSystemDarkMode; // Fall back to system preference
  }
  
  if (isDarkMode) {
    document.body.classList.add("dark-mode"); // Enable dark mode
    darkModeToggle.textContent = "☀️"; // Set sun icon for dark mode
  } else {
    darkModeToggle.textContent = "🌙"; // Set moon icon for light mode
  }
  
  // **Dark mode toggle functionality**
  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode"); // Toggle dark mode
    const isDark = document.body.classList.contains("dark-mode");
    try {
      safeStorage.setItem("darkMode", isDark); // Save dark mode preference in storage
    } catch (error) {
      console.error("Failed to save dark mode preference:", error);
    }
    darkModeToggle.textContent = isDark ? "☀️" : "🌙"; // Toggle button icon based on mode
  });
  
  /**
   * Update character count display as user types
   * Changes color when approaching limit and disables button for empty input
   */
  // **Update character count as user types**
  const updateCharCount = () => {
    const remainingChars = MAX_CHARS - input.value.length;
    charCount.textContent = `${input.value.length} / ${MAX_CHARS}`; // Display character count
    // Change color to red when nearing character limit
    charCount.style.color = remainingChars < 20 ? "#e74c3c" : "#777";
    // Disable the add button if input is empty
    document.getElementById("add-button").disabled = input.value.trim() === "";
  };
  
  // Add input event listener to update character count
  input.addEventListener("input", updateCharCount);
  
  /**
   * Save todos array to persistent storage
   * Handles storage errors gracefully with user feedback
   */
  // **Save todos to storage**
  const saveTodos = () => {
    try {
      safeStorage.setItem("todos", JSON.stringify(todos)); // Store todos array in storage
    } catch (error) {
      console.error("Failed to save todos to storage:", error);
      // Show user feedback for storage issues
      if (error.name === 'QuotaExceededError') {
        alert("Storage quota exceeded. Please clear some browser data or reduce the number of todos.");
      } else if (!isLocalStorageAvailable()) {
        console.warn("Using temporary memory storage - todos will not persist after page refresh.");
      } else {
        alert("Failed to save todos. Your changes may not be preserved.");
      }
    }
  };
  
  /**
   * Render todos in the DOM with full accessibility support
   * Creates list items with ARIA attributes, keyboard navigation, and drag-drop
   */
  // **Render todos in the DOM**
  const renderTodos = () => {
    todoList.innerHTML = ""; // Clear existing todos
    todos.forEach((todo, index) => {
      const li = document.createElement("li");
      li.classList.add("fade-in"); // Add fade-in animation
      if (todo.completed) li.classList.add("completed"); // Apply completed style
      
      // Add accessibility attributes
      li.setAttribute("role", "listitem");
      li.setAttribute("aria-labelledby", `todo-text-${index}`);
      li.setAttribute("aria-describedby", `todo-buttons-${index}`);
      li.setAttribute("tabindex", "0");
      
      // Create todo text span safely
      const todoText = document.createElement("span");
      todoText.className = "todo-text";
      todoText.id = `todo-text-${index}`;
      todoText.textContent = todo.text; // Safe text insertion - prevents XSS
      todoText.setAttribute("aria-label", `Todo item: ${todo.text}${todo.completed ? ' (completed)' : ' (pending)'}`);
      
      // Create buttons container
      const buttonsDiv = document.createElement("div");
      buttonsDiv.className = "todo-buttons";
      buttonsDiv.id = `todo-buttons-${index}`;
      buttonsDiv.setAttribute("role", "group");
      buttonsDiv.setAttribute("aria-label", "Todo actions");
      
      // Create complete/undo button
      const completeButton = document.createElement("button");
      completeButton.textContent = todo.completed ? t("undo") : t("complete");
      completeButton.setAttribute("aria-label", 
        todo.completed ? `Mark "${todo.text}" as incomplete` : `Mark "${todo.text}" as complete`
      );
      completeButton.setAttribute("aria-pressed", todo.completed ? "true" : "false");
      completeButton.addEventListener("click", () => toggleComplete(index));
      
      // Create delete button
      const deleteButton = document.createElement("button");
      deleteButton.textContent = t("delete");
      deleteButton.setAttribute("aria-label", `Delete todo "${todo.text}"`);
      deleteButton.addEventListener("click", () => deleteTodo(index));
      
      // Add keyboard navigation for list items
      li.addEventListener("keydown", (e) => handleTodoKeydown(e, index));
      
      // Append buttons to container
      buttonsDiv.appendChild(completeButton);
      buttonsDiv.appendChild(deleteButton);
      
      // Append elements to list item
      li.appendChild(todoText);
      li.appendChild(buttonsDiv);
      
      li.setAttribute("data-index", index);
      addDragListeners(li); // Add drag-and-drop listeners
      addKeyboardDragListeners(); // Add keyboard drag-and-drop
      todoList.appendChild(li); // Append to the todo list
    });
    
    // Update live region for screen readers
    updateAriaLiveRegion();
  };
  
  /**
   * Validate and sanitize user input before adding todos
   * @param {string} text - Raw user input text
   * @returns {string|null} Sanitized text or null if invalid
   */
  // **Input validation and sanitization**
  const validateAndSanitizeInput = (text) => {
    // Trim whitespace
    text = text.trim();
    
    // Check if empty after trimming
    if (text === "") return null;
    
    // Enforce maximum length (already limited by HTML maxlength, but double-check)
    if (text.length > MAX_CHARS) {
      text = text.substring(0, MAX_CHARS);
    }
    
    // Remove null bytes and other control characters that could cause issues
    text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // Remove leading/trailing whitespace again after sanitization
    text = text.trim();
    
    // Final check if still has content
    return text.length > 0 ? text : null;
  };

  /**
   * Add a new todo item after validation and sanitization
   * Prevents duplicates and focuses the new item for accessibility
   */
  // **Add new todo**
  const addTodo = () => {
    const sanitizedText = validateAndSanitizeInput(input.value);
    
    if (sanitizedText === null) return; // Prevent empty or invalid todos
    
    // Check for duplicate todos (optional quality improvement)
    const isDuplicate = todos.some(todo => todo.text.toLowerCase() === sanitizedText.toLowerCase());
    if (isDuplicate) {
      // Could show user feedback here, but for now just silently ignore
      input.value = ""; // Clear input field
      updateCharCount(); // Reset character count
      return;
    }
    
    todos.push({ text: sanitizedText, completed: false }); // Add sanitized todo to the array
    saveTodos(); // Save updated todos to localStorage
    renderTodos(); // Re-render the list
    input.value = ""; // Clear input field
    updateCharCount(); // Reset character count
    
    // Focus the newly added todo for accessibility
    setTimeout(() => {
      const newTodo = todoList.querySelector(`li:last-child`);
      if (newTodo) {
        newTodo.focus();
        // Announce the addition to screen readers
        if (ariaLiveRegion) {
          ariaLiveRegion.textContent = `Added new todo: ${sanitizedText}`;
        }
      }
    }, 100);
  };
  
  // **Form submission listener**
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent page reload on form submission
    addTodo(); // Add the new todo
  });
  
  /**
   * Toggle the completion status of a todo item
   * @param {number} index - Index of the todo to toggle
   */
  // **Toggle todo completion status**
  const toggleComplete = (index) => {
    const todo = todos[index];
    todo.completed = !todo.completed; // Toggle the completion status
    saveTodos(); // Save updated todos to localStorage
    renderTodos(); // Re-render the list
    
    // Focus the toggled item and announce change
    setTimeout(() => {
      const toggledItem = todoList.querySelector(`li[data-index="${index}"]`);
      if (toggledItem) {
        toggledItem.focus();
        // Announce the status change to screen readers
        if (ariaLiveRegion) {
          const status = todo.completed ? 'completed' : 'marked as incomplete';
          ariaLiveRegion.textContent = `Todo "${todo.text}" ${status}`;
        }
      }
    }, 100);
  };
  
  /**
   * Delete a todo item with proper focus management
   * @param {number} index - Index of the todo to delete
   */
  // **Delete a todo**
  const deleteTodo = (index) => {
    const deletedTodo = todos[index];
    todos.splice(index, 1); // Remove the selected todo
    saveTodos(); // Save updated todos to localStorage
    renderTodos(); // Re-render the list
    
    // Focus management after deletion
    setTimeout(() => {
      const items = Array.from(todoList.children);
      let focusTarget = null;
      
      // Focus the item at the same index, or the last item, or the input
      if (items[index]) {
        focusTarget = items[index];
      } else if (items[index - 1]) {
        focusTarget = items[index - 1];
      } else if (items.length > 0) {
        focusTarget = items[0];
      } else {
        focusTarget = input;
      }
      
      if (focusTarget) {
        focusTarget.focus();
      }
      
      // Announce the deletion to screen readers
      if (ariaLiveRegion) {
        ariaLiveRegion.textContent = `Deleted todo: ${deletedTodo.text}`;
      }
    }, 100);
  };
  
  /**
   * Drag and drop functionality for reordering todos
   * Supports both mouse and touch events
   */
  // **Drag and drop functionality**
  let draggedItem = null;
  let dragStartY = 0;
  let dragStartIndex = 0;
  
  /**
   * Add drag and drop event listeners to a todo element
   * Supports both mouse and touch interactions for reordering
   * @param {HTMLElement} element - The todo list item element
   */
  const addDragListeners = (element) => {
    element.addEventListener("mousedown", dragStart); // Mouse drag start
    element.addEventListener("touchstart", dragStart); // Touch drag start
    element.addEventListener("touchmove", dragMove); // Touch drag move
    element.addEventListener("touchend", dragEnd); // Touch drag end
  };
  
  /**
   * Initialize drag operation - stores initial position and sets up visual feedback
   * @param {Event} e - Mouse or touch event
   */
  const dragStart = (e) => {
    dragStartY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;
    draggedItem = e.currentTarget;
    dragStartIndex = parseInt(draggedItem.getAttribute("data-index"));
    setTimeout(() => {
      draggedItem.classList.add("dragging");
      document.body.classList.add("disable-selection");
    }, 0);
  
    document.addEventListener("mousemove", dragMove);
    document.addEventListener("mouseup", dragEnd);
  };
  
  /**
   * Handle drag movement - provides visual feedback for drop targets
   * @param {Event} e - Mouse or touch move event
   */
  const dragMove = (e) => {
    if (!draggedItem) return;
    e.preventDefault();
  
    const currentY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;
    const listItems = Array.from(todoList.children);
    const draggedIndex = listItems.indexOf(draggedItem);
  
    // Add visual feedback to potential drop targets
    listItems.forEach((item, index) => {
      if (item !== draggedItem) {
        const rect = item.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
  
        if (currentY < midY && index < draggedIndex) {
          item.classList.add("drag-over");
        } else if (currentY > midY && index > draggedIndex) {
          item.classList.add("drag-over");
        } else {
          item.classList.remove("drag-over");
        }
      }
    });
  };
  
  /**
   * Complete drag operation - reorder todos if dropped on valid target
   * Cleans up visual feedback and updates data if needed
   */
  const dragEnd = () => {
    if (!draggedItem) return;
  
    document.removeEventListener("mousemove", dragMove);
    document.removeEventListener("mouseup", dragEnd);
  
    const listItems = Array.from(todoList.children);
    const newIndex = listItems.findIndex((item) => item.classList.contains("drag-over"));
  
    // Reorder todos if dropped on a different position
    if (newIndex !== -1 && newIndex !== dragStartIndex) {
      const [removed] = todos.splice(dragStartIndex, 1);
      todos.splice(newIndex, 0, removed);
      saveTodos();
      renderTodos();
    } else {
      draggedItem.classList.remove("dragging");
    }
  
    // Clean up visual feedback
    listItems.forEach((item) => item.classList.remove("drag-over"));
    document.body.classList.remove("disable-selection");
    draggedItem = null;
  };
  
  // **Keyboard navigation and accessibility functions**
  
  /**
   * Handle keyboard navigation and shortcuts for todo items
   * @param {KeyboardEvent} e - The keyboard event
   * @param {number} index - Index of the current todo item
   */
  // Handle keyboard navigation for todo items
  const handleTodoKeydown = (e, index) => {
    const currentItem = e.currentTarget;
    const items = Array.from(todoList.children);
    const currentIndex = items.indexOf(currentItem);
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextItem = items[currentIndex + 1];
        if (nextItem) nextItem.focus();
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        const prevItem = items[currentIndex - 1];
        if (prevItem) prevItem.focus();
        break;
        
      case 'Home':
        e.preventDefault();
        if (items[0]) items[0].focus();
        break;
        
      case 'End':
        e.preventDefault();
        if (items[items.length - 1]) items[items.length - 1].focus();
        break;
        
      case 'Enter':
      case ' ':
        e.preventDefault();
        toggleComplete(index);
        break;
        
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        deleteTodo(index);
        break;
        
      case 'Control+ArrowUp':
      case 'Meta+ArrowUp':
        e.preventDefault();
        moveTodo(index, index - 1);
        break;
        
      case 'Control+ArrowDown':
      case 'Meta+ArrowDown':
        e.preventDefault();
        moveTodo(index, index + 1);
        break;
    }
  };
  
  /**
   * Move a todo item to a new position in the list
   * @param {number} fromIndex - Current index of the todo
   * @param {number} toIndex - Target index for the todo
   */
  // Move todo item to new position
  const moveTodo = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= todos.length || fromIndex === toIndex) {
      return;
    }
    
    const [removed] = todos.splice(fromIndex, 1);
    todos.splice(toIndex, 0, removed);
    saveTodos();
    renderTodos();
    
    // Focus the moved item
    const items = Array.from(todoList.children);
    if (items[toIndex]) {
      items[toIndex].focus();
    }
  };
  
  // Add keyboard drag-and-drop functionality
  const addKeyboardDragListeners = () => {
    // Keyboard drag functionality is handled in handleTodoKeydown
    // This function exists for consistency with the renderTodos call
  };
  
  /**
   * Create and manage ARIA live region for screen reader announcements
   * Provides status updates for accessibility
   */
  // Create and manage ARIA live region for announcements
  let ariaLiveRegion = null;
  
  /**
   * Create invisible ARIA live region for screen reader announcements
   * Positioned off-screen but accessible to assistive technology
   */
  const createAriaLiveRegion = () => {
    if (!ariaLiveRegion) {
      ariaLiveRegion = document.createElement('div');
      ariaLiveRegion.setAttribute('aria-live', 'polite');
      ariaLiveRegion.setAttribute('aria-atomic', 'true');
      ariaLiveRegion.style.position = 'absolute';
      ariaLiveRegion.style.left = '-10000px';
      ariaLiveRegion.style.width = '1px';
      ariaLiveRegion.style.height = '1px';
      ariaLiveRegion.style.overflow = 'hidden';
      document.body.appendChild(ariaLiveRegion);
    }
  };
  
  /**
   * Update ARIA live region with current todo statistics
   * Announces changes to screen readers without being visually intrusive
   */
  const updateAriaLiveRegion = () => {
    if (!ariaLiveRegion) return;
    
    const completedCount = todos.filter(todo => todo.completed).length;
    const totalCount = todos.length;
    const pendingCount = totalCount - completedCount;
    
    ariaLiveRegion.textContent = `${totalCount} todos total. ${pendingCount} pending, ${completedCount} completed.`;
  };
  
  /**
   * Global keyboard shortcuts for enhanced accessibility
   * Ctrl+/ focuses input, Ctrl+L focuses first todo
   */
  // Add global keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Focus input with Ctrl/Cmd + /
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      input.focus();
    }
    
    // Focus first todo with Ctrl/Cmd + L
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
      e.preventDefault();
      const firstTodo = todoList.querySelector('li');
      if (firstTodo) firstTodo.focus();
    }
  });
  
  // Initialize accessibility features
  createAriaLiveRegion();
  
  // Initial render
  renderTodos(); // Render the initial list of todos
  updateCharCount(); // Initialize the character count display
  