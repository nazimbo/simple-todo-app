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
  
  // Determine user's language preference
  const userLang = navigator.language.split("-")[0]; // Get the language code (e.g., 'en' from 'en-US')
  const lang = ["en", "fr"].includes(userLang) ? userLang : "en"; // Default to English if not supported
  
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
  let todos = JSON.parse(localStorage.getItem("todos")) || [];
  
  // **Dark mode functionality**
  // Check if dark mode preference is set in localStorage or matches system preferences
  const isSystemDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches; // System dark mode preference
  const isDarkMode = localStorage.getItem("darkMode") === "true" || (!localStorage.getItem("darkMode") && isSystemDarkMode);
  
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
    localStorage.setItem("darkMode", isDark); // Save dark mode preference in localStorage
    darkModeToggle.textContent = isDark ? "☀️" : "🌙"; // Toggle button icon based on mode
  });
  
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
  
  // **Save todos to localStorage**
  const saveTodos = () => {
    localStorage.setItem("todos", JSON.stringify(todos)); // Store todos array in localStorage
  };
  
  // **Render todos in the DOM**
  const renderTodos = () => {
    todoList.innerHTML = ""; // Clear existing todos
    todos.forEach((todo, index) => {
      const li = document.createElement("li");
      li.classList.add("fade-in"); // Add fade-in animation
      if (todo.completed) li.classList.add("completed"); // Apply completed style
      
      // Create todo text span safely
      const todoText = document.createElement("span");
      todoText.className = "todo-text";
      todoText.textContent = todo.text; // Safe text insertion - prevents XSS
      
      // Create buttons container
      const buttonsDiv = document.createElement("div");
      buttonsDiv.className = "todo-buttons";
      
      // Create complete/undo button
      const completeButton = document.createElement("button");
      completeButton.textContent = todo.completed ? t("undo") : t("complete");
      completeButton.addEventListener("click", () => toggleComplete(index));
      
      // Create delete button
      const deleteButton = document.createElement("button");
      deleteButton.textContent = t("delete");
      deleteButton.addEventListener("click", () => deleteTodo(index));
      
      // Append buttons to container
      buttonsDiv.appendChild(completeButton);
      buttonsDiv.appendChild(deleteButton);
      
      // Append elements to list item
      li.appendChild(todoText);
      li.appendChild(buttonsDiv);
      
      li.setAttribute("data-index", index);
      addDragListeners(li); // Add drag-and-drop listeners
      todoList.appendChild(li); // Append to the todo list
    });
  };
  
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
  };
  
  // **Form submission listener**
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent page reload on form submission
    addTodo(); // Add the new todo
  });
  
  // **Toggle todo completion status**
  const toggleComplete = (index) => {
    todos[index].completed = !todos[index].completed; // Toggle the completion status
    saveTodos(); // Save updated todos to localStorage
    renderTodos(); // Re-render the list
  };
  
  // **Delete a todo**
  const deleteTodo = (index) => {
    todos.splice(index, 1); // Remove the selected todo
    saveTodos(); // Save updated todos to localStorage
    renderTodos(); // Re-render the list
  };
  
  // **Drag and drop functionality (same as before)**
  let draggedItem = null;
  let dragStartY = 0;
  let dragStartIndex = 0;
  
  const addDragListeners = (element) => {
    element.addEventListener("mousedown", dragStart); // Mouse drag start
    element.addEventListener("touchstart", dragStart); // Touch drag start
    element.addEventListener("touchmove", dragMove); // Touch drag move
    element.addEventListener("touchend", dragEnd); // Touch drag end
  };
  
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
  
  const dragMove = (e) => {
    if (!draggedItem) return;
    e.preventDefault();
  
    const currentY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;
    const listItems = Array.from(todoList.children);
    const draggedIndex = listItems.indexOf(draggedItem);
  
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
  
  const dragEnd = () => {
    if (!draggedItem) return;
  
    document.removeEventListener("mousemove", dragMove);
    document.removeEventListener("mouseup", dragEnd);
  
    const listItems = Array.from(todoList.children);
    const newIndex = listItems.findIndex((item) => item.classList.contains("drag-over"));
  
    if (newIndex !== -1 && newIndex !== dragStartIndex) {
      const [removed] = todos.splice(dragStartIndex, 1);
      todos.splice(newIndex, 0, removed);
      saveTodos();
      renderTodos();
    } else {
      draggedItem.classList.remove("dragging");
    }
  
    listItems.forEach((item) => item.classList.remove("drag-over"));
    document.body.classList.remove("disable-selection");
    draggedItem = null;
  };
  
  // Initial render
  renderTodos(); // Render the initial list of todos
  updateCharCount(); // Initialize the character count display
  