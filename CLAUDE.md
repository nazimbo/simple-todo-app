# CLAUDE.md

Guidance for AI assistants (and humans) working in this repository.

## Project Overview

**Simple Todo App** is a modern, accessible todo application built with **vanilla
JavaScript, HTML, and CSS** — no frameworks, no build step, no runtime
dependencies. It runs directly in the browser by opening `index.html`.

Key capabilities: add/complete/delete todos, drag-and-drop reordering (mouse +
touch), keyboard navigation and reordering, dark mode with system-preference
detection, internationalization (English/French), localStorage persistence with
an in-memory fallback, and input validation/sanitization for XSS protection.

## Architecture

This is a three-file front-end app. There is no bundler, transpiler, or package
to install — the browser loads the source files as-is.

```
simple-todo-app/
├── index.html   # Markup, element IDs, loads the Google Inter font + script.js
├── script.js    # ALL application logic (single file, ~750 lines)
├── style.css    # Styling via CSS custom properties, dark mode, responsive
├── package.json # Metadata + npm scripts (dev server). No real dependencies used.
└── README.md    # User-facing documentation
```

### How it fits together
- `index.html` defines static elements with fixed IDs: `todo-form`,
  `todo-input`, `char-count`, `add-button`, `todo-list`, `app-title`,
  `dark-mode-toggle`. `script.js` looks these up by ID — **keep IDs in sync**
  across the two files.
- `script.js` runs top-to-bottom on load (the `<script>` tag is at the end of
  `<body>`, so the DOM is ready — there is no `DOMContentLoaded` wrapper).
- State lives in a single module-level `todos` array. Every mutation follows the
  same pattern: **mutate `todos` → `saveTodos()` → `renderTodos()`**.
- `renderTodos()` clears and rebuilds the entire `<ul>` from the `todos` array
  (full re-render, no diffing). Todo identity is positional (array index), and
  the index is stored on each `<li>` via `data-index`.

### Data model
A todo is a plain object: `{ text: string, completed: boolean }`. There are no
IDs, timestamps, or other fields. Persisted as JSON under the localStorage key
`"todos"`. Dark mode preference is stored under the key `"darkMode"` ("true"/"false").

### Storage layer
- `isLocalStorageAvailable()` feature-detects localStorage (handles privacy
  modes / disabled storage).
- `safeStorage` is a wrapper exposing `getItem`/`setItem`/`removeItem` that
  transparently falls back to an in-memory object (`memoryStorage`) when
  localStorage is unavailable. **Always go through `safeStorage`, never call
  `localStorage` directly.**
- `loadTodos()` defensively parses stored data: checks type, checks JSON shape,
  parses, validates it's an array, then validates/sanitizes each item via
  `validateTodo()`. Corrupted data is cleared and reset to `[]` rather than
  throwing.

### Security / validation
XSS protection is a core invariant — preserve it:
- `validateAndSanitizeInput()` sanitizes new user input (trim, length cap,
  strip control characters).
- `validateTodo()` sanitizes data loaded from storage (strips HTML tags and
  control characters, enforces length, validates types).
- Rendering uses `textContent` (never `innerHTML`) for any user-derived text.
  **Never introduce `innerHTML` with user data.**
- `MAX_CHARS = 100` is enforced in JS *and* via the `maxlength` attribute in
  HTML. Keep both in sync if changed.
- Duplicate todos (case-insensitive text match) are silently ignored on add.

### Accessibility (first-class concern)
- ARIA roles/labels on list, items, and buttons; `aria-pressed` reflects
  completion state.
- An off-screen `aria-live` region (`ariaLiveRegion`, created by
  `createAriaLiveRegion()`) announces add/complete/delete/count changes.
- Full keyboard support and focus management after every mutation (focus moves
  to a sensible target after add/delete/toggle/move).
- `handleTodoKeydown(e, index)` drives per-item keyboard interaction. It guards
  toggle/delete with `e.target === e.currentTarget` so those keys only fire when
  the list item itself is focused, not when a child button has focus.
- When adding features, maintain ARIA labels, keyboard operability, and live-region announcements.

### Internationalization
- `translations` object holds `en` and `fr` strings. Language is auto-detected
  from `navigator.language` and falls back to English. There is no manual
  language switcher.
- Use the `t(key)` helper for any user-facing string, and add the key to **both**
  `en` and `fr` in the `translations` object.

### Styling
- `style.css` uses CSS custom properties (`:root` variables) for the color
  system. Dark mode is a `body.dark-mode` class toggled in JS; define dark
  variants under `body.dark-mode ...` selectors.
- Mobile-first responsive design with a `@media (max-width: 640px)` breakpoint.

## Development Workflow

No build or install is required. Two ways to run:

```bash
# Option A: just open the file
open index.html          # (or double-click it)

# Option B: run a local static server (matches npm scripts)
npm start                # -> python3 -m http.server 8000  (serves at :8000)
npm run dev              # same as start
npm run serve            # same as start
```

> Note: `package.json` lists `eslint`, `prettier`, and `jest` under
> `devDependencies`, but **no linter or test suite is actually configured** —
> `npm test` and `npm run lint` just echo a reminder. There are currently no
> automated tests. Verify changes manually in the browser. You can syntax-check
> the script with `node --check script.js`.

### Manual verification checklist
After changes, open the app and confirm:
- Add, complete/undo, and delete a todo.
- Drag-and-drop reordering, and `Ctrl/Cmd+Arrow Up/Down` keyboard reordering when
  a todo item is focused.
- Arrow Up/Down / Home / End navigate between focused todo items.
- Dark mode toggle persists across reload.
- Character counter updates and the Add button disables on empty input.
- Reload the page — todos persist.

## Conventions

- **Vanilla JS only.** Do not add frameworks, build tooling, or npm runtime
  dependencies unless explicitly requested — keeping the app dependency-free and
  buildless is a deliberate design choice.
- Modern ES6+ syntax: `const`/`let`, arrow functions, template literals.
- Functions are documented with JSDoc-style block comments; match that style.
- Keep all app logic in `script.js`; keep markup in `index.html`; keep styles in
  `style.css`.
- Follow the existing mutate → `saveTodos()` → `renderTodos()` flow for any
  state change so persistence and the UI stay consistent.
- Browser support targets (see `package.json` `browserslist`): Chrome 60+,
  Firefox 55+, Safari 12+, Edge 79+. Avoid APIs newer than these baselines.
- For keyboard modifier combinations, check `e.ctrlKey`/`e.metaKey` alongside
  `e.key` — `KeyboardEvent.key` only holds the single key, never a combined
  string like `"Control+ArrowUp"`.

## Git Workflow

- Commit messages follow Conventional Commits (`feat:`, `fix:`, `refactor:`,
  `style:`, etc.) — match the existing history.
- Do not open pull requests unless explicitly requested.
</content>
