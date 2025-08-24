# funcwc - DOM-Native SSR Web Components

**Ultra-lightweight, type-safe web components with the DOM as your state
container.**

Built for Deno + TypeScript, funcwc takes a revolutionary approach: **the DOM
_is_ the state**. No JavaScript state objects, no synchronization overhead, just
pure DOM manipulation with a delightful developer experience.

## ✨ Key Features

- **🎯 DOM-Native State**: Component state lives in CSS classes, data
  attributes, and element content
- **⚡ Type-Safe**: Full TypeScript inference with zero casting required
- **🚀 SSR-First**: Render on server, send optimized HTML
- **🔄 HTMX Ready**: Built-in server actions for dynamic updates
- **📦 Zero Runtime**: No client-side framework dependencies
- **🎨 Functional API**: Chainable pipeline design

## 🚀 Quick Start

```bash
# Clone and run examples
git clone <repository-url> && cd funcwc
deno task serve  # → http://localhost:8080
```

## 🎯 Philosophy: DOM as State

Instead of managing JavaScript state objects, funcwc uses the DOM itself:

- **CSS Classes** → UI states (`active`, `open`, `loading`)
- **Data Attributes** → Component data (`data-count="5"`)
- **Element Content** → Display values (counter numbers, text)
- **Form Values** → Input states (checkboxes, text inputs)

This eliminates state synchronization bugs and makes debugging trivial—just
inspect the DOM!

## 🎬 See It In Action

Run `deno task serve` and visit http://localhost:8080 to see all examples
working:

- **🎨 Theme Toggle**: CSS class switching
- **🔢 Counter**: Data attributes + element content
- **✅ Todo Items**: Checkbox state + HTMX server sync
- **📁 Accordion**: Pure CSS transitions
- **📑 Tabs**: Multi-element state coordination

## 📋 Complete Examples

### 🎨 Theme Toggle - Pure DOM State

```tsx
import { component, toggleClasses } from "./src/index.ts";

component("theme-toggle")
  .styles(`
    .theme-btn { padding: 0.5rem 1rem; border: 1px solid; border-radius: 6px; cursor: pointer; }
    .theme-btn.light { background: #fff; color: #333; }
    .theme-btn.dark { background: #333; color: #fff; }
    .theme-btn.dark .light-icon { display: none; }
    .theme-btn.light .dark-icon { display: none; }
  `)
  .view(() => (
    <button
      class="theme-btn light"
      onClick={toggleClasses(["light", "dark"])} // ✨ Direct function call!
    >
      <span class="light-icon">☀️ Light</span>
      <span class="dark-icon">🌙 Dark</span>
    </button>
  ));
```

**Key Benefits:**

- ✅ No JavaScript state objects
- ✅ CSS handles the visual transitions
- ✅ State visible in DOM inspector
- ✅ Type-safe event handlers

### 🔢 Counter - Type-Safe Props + DOM State

```tsx
import { component } from "./src/index.ts";
import { resetCounter, updateParentCounter } from "./examples/dom-actions.ts";

component("counter")
  .props({ initialCount: "number?", step: "number?" }) // Type hints
  .styles(`
    .counter { display: inline-flex; gap: 0.5rem; padding: 1rem; border: 2px solid #007bff; }
    .counter button { padding: 0.5rem; background: #007bff; color: white; border: none; }
    .count-display { font-size: 1.5rem; min-width: 3rem; text-align: center; }
  `)
  .view((props) => {
    // ✨ Fully typed props - no casting needed in latest version!
    const count = props.initialCount ?? 0;
    const step = props.step ?? 1;

    return (
      <div class="counter" data-count={count}>
        <button
          onClick={updateParentCounter(".counter", ".count-display", -step)}
        >
          -{step}
        </button>
        <span class="count-display">{count}</span>
        <button
          onClick={updateParentCounter(".counter", ".count-display", step)}
        >
          +{step}
        </button>
        <button onClick={resetCounter(".count-display", count, ".counter")}>
          Reset
        </button>
      </div>
    );
  });
```

**DOM State in Action:**

- Counter value stored in `data-count` attribute
- Display synced with element `.textContent`
- No JavaScript variables to manage!

### ✅ Todo Item - Server Actions + Local State

```tsx
import { component, conditionalClass } from "./src/index.ts";
import { syncCheckboxToClass } from "./examples/dom-actions.ts";

component("f-todo-item")
  .props({ id: "string", text: "string", done: "boolean?" })
  .api({
    // Just define the API endpoints - client functions are auto-generated!
    "PATCH /api/todos/:id/toggle": async (req, params) => {
      const form = await req.formData();
      const isDone = form.get("done") === "true";
      return new Response(
        renderComponent("f-todo-item", {
          id: params.id,
          text: "Toggled item!",
          done: !isDone,
        }),
      );
    },
    "DELETE /api/todos/:id": (_req, _params) => {
      return new Response(null, { status: 200 });
    },
  })
  .styles(`
    .todo { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 0.5rem; }
    .todo.done { background: #f8f9fa; opacity: 0.7; }
    .todo.done .todo-text { text-decoration: line-through; color: #6c757d; }
    .delete-btn { background: #dc3545; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; }
  `)
  .view((props: { id: string; text: string; done?: boolean }, api) => {
    const isDone = Boolean(props.done);
    const id = props.id;
    const text = props.text;
    const todoClass = "todo " + conditionalClass(isDone, "done");

    return (
      <div class={todoClass} data-id={id}>
        <input
          type="checkbox"
          checked={isDone}
          onChange={syncCheckboxToClass("done")}
          {...(api?.toggle?.(id) || {})}
        />
        <span class="todo-text">{text}</span>
        <button type="button" class="delete-btn" {...(api?.delete?.(id) || {})}>
          ×
        </button>
      </div>
    );
  });
```

**Hybrid State Management:**

- ✅ **Local UI state**: Checkbox syncs to CSS class instantly
- ✅ **Server persistence**: HTMX handles data updates
- ✅ **No state conflicts**: DOM is the single source of truth

## 🔧 Pipeline API Reference

### `component(name: string)`

Starts a new component definition. Component names should be kebab-case.

```tsx
component("my-component"); // Creates <my-component> custom element
```

### `.props(spec: PropSpec)`

Type-safe prop parsing with automatic TypeScript inference.

```tsx
.props({ 
  count: 'number',      // Required number
  step: 'number?',      // Optional number  
  disabled: 'boolean?', // Optional boolean
  title: 'string'       // Required string
})
// Props are fully typed in .view() - no casting needed!
```

### `.serverActions(actions: ActionMap)`

Define server-side actions that return HTMX attributes.

```tsx
.serverActions({
  save: (id) => ({ 'hx-post': `/api/save/${id}`, 'hx-target': '#result' }),
  delete: (id) => ({ 'hx-delete': `/api/items/${id}`, 'hx-confirm': 'Delete?' })
})
```

### `.api(routes: RouteMap)`

Define API endpoints directly in the component.

```tsx
.api({
  'POST /api/items': async (req) => { /* handle create */ },
  'DELETE /api/items/:id': async (req, params) => { /* handle delete */ }
})
```

### `.styles(css: string)`

Component-scoped CSS that renders with SSR output.

```tsx
.styles(`
  .my-button { background: blue; color: white; }
  .my-button:hover { background: darkblue; }
`)
```

### `.view((props, serverActions?, parts?) => JSX.Element)`

The render function. Returns JSX that compiles to optimized HTML strings.

```tsx
.view((props, serverActions) => (
  <div class="container">
    <button onClick={someAction}>Click me</button>
  </div>
))
```

## 🎮 DOM Helpers

**Core helpers shipped by the library:**

### Class Manipulation

```tsx
toggleClass("active"); // Toggle single class
toggleClasses(["open", "visible"]); // Toggle multiple classes
```

### Template Utilities

```tsx
conditionalClass(isOpen, "open", "closed"); // Conditional CSS classes
spreadAttrs({ "hx-get": "/api/data" }); // Spread HTMX attributes
dataAttrs({ userId: 123, role: "admin" }); // Generate data-* attributes
```

### Example-only helpers (in `examples/dom-actions.ts`)

Small, copyable helpers that return inline handler strings for common UI
patterns:

```tsx
updateParentCounter(".container", ".display", 5); // Increment by 5
resetCounter(".display", 0, ".container"); // Reset to initial value
toggleParentClass("expanded"); // Toggle class on parent element
syncCheckboxToClass("completed"); // Checkbox state → CSS class
activateTab(".tabs", ".tab-btn", ".content", "active"); // Tab activation
```

These are app-level conveniences and intentionally live outside the library to
keep the core clean and framework-agnostic.

## 🛠 Development Commands

```bash
deno task serve      # Development server → http://localhost:8080
deno task start      # Type check + serve (recommended)
deno task check      # Type check all files
deno task test       # Run tests
deno task fmt        # Format code
deno task lint       # Lint code
```

## 🎯 Why funcwc?

### Traditional React/Vue Problems:

```tsx
// ❌ Complex state management
const [count, setCount] = useState(0);
const [isOpen, setIsOpen] = useState(false);
const [loading, setLoading] = useState(false);

// ❌ State synchronization bugs
// ❌ Prop drilling
// ❌ Large bundle sizes
// ❌ Hydration mismatches
```

### funcwc Solution:

```tsx
// ✅ DOM is the state - no synchronization needed!
component("my-widget")
  .view(() => (
    <div class="widget closed" data-count="0">
      <button onClick={toggleClass("open")}>Toggle</button>
      <span class="counter">0</span>
    </div>
  ));

// ✅ Zero runtime JavaScript
// ✅ Perfect SSR
// ✅ No hydration issues
// ✅ Instant debugging (inspect DOM)
```

## 🚀 Performance Benefits

- **🏃‍♂️ Faster**: No client-side state management overhead
- **📦 Smaller**: Zero runtime dependencies, minimal JavaScript
- **🔧 Simpler**: DOM inspector shows all state
- **⚡ Instant**: Direct DOM manipulation, no virtual DOM
- **🎯 Reliable**: No state synchronization bugs

---

**Built with ❤️ for the modern web. Deno + TypeScript + DOM-native state
management.**
