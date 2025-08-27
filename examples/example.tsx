/** @jsx h */
/// <reference path="../src/lib/jsx.d.ts" />
import {
  defineComponent,
  del,
  h,
  patch,
  renderComponent,
  toggleClasses,
  string,
  number,
  boolean,
} from "../src/index.ts";
import type { GeneratedApiMap } from "../src/index.ts";

import {
  activateTab,
  resetCounter,
  syncCheckboxToClass,
  updateParentCounter,
} from "./dom-actions.ts";

// 🎉 NEW: Unified Styles API Showcase - Now with function-style props!
defineComponent("unified-card", {
  styles: {
    card: `{ border: 2px solid #e9ecef; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; background: white; transition: all 0.2s ease; }`,
    title: `{ font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem; color: #495057; }`,
    content: `{ color: #6c757d; line-height: 1.5; }`,
    highlight: `{ border-color: #007bff !important; background: #f8f9ff; box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15); }`,
  },
  render: ({ 
    title = string("Unified Styles"),
    highlighted = boolean(false)
  }, _api: undefined, classes?: Record<string, string>) => {
    const titleStr = title as unknown as string;
    const highlightedBool = highlighted as unknown as boolean;
    return (
      <div class={`${classes!.card} ${highlightedBool ? classes!.highlight : ""}`}>
        <h3 class={classes!.title}>{titleStr}</h3>
        <div class={classes!.content}>
          <p>🚀 This component uses the new unified styles API!</p>
          <p>✅ No more duplication between classes and styles</p>
          <p>🎯 Class names are automatically extracted from CSS selectors</p>
          <p>💡 Much cleaner and more maintainable</p>
        </div>
      </div>
    );
  },
});

// Theme Toggle - Pure DOM State (uses complex selectors)
defineComponent("theme-toggle", {
  styles: {
    button: `.theme-btn { padding: 0.5rem 1rem; border: 2px solid; border-radius: 6px; cursor: pointer; font-weight: 500; transition: border-color 0.2s ease, box-shadow 0.2s ease; background: none; }`,
    buttonLight: `.theme-btn.light { background: #fff; color: #333; border-color: #ddd; }`,
    buttonLightHover: `.theme-btn.light:hover { border-color: #007bff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }`,
    buttonDark: `.theme-btn.dark { background: #2d3748; color: #f7fafc; border-color: #4a5568; }`,
    buttonDarkHover: `.theme-btn.dark:hover { border-color: #63b3ed; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }`,
    lightIcon: `.light-icon { display: inline; }`,
    darkIcon: `.dark-icon { display: inline; }`,
    iconHiddenInDark: `.theme-btn.dark .light-icon, .theme-btn.light .dark-icon { display: none !important; }`,
    iconVisibleInTheme: `.theme-btn.dark .dark-icon, .theme-btn.light .light-icon { display: inline; }`
  },
  render: (
    _props: Record<string, never>,
    _api: undefined,
    classes?: Record<string, string>,
  ) => (
    <button
      type="button"
      class={`${classes!.button} light`}
      onclick={toggleClasses(["light", "dark"])}
    >
      <span class={classes!.lightIcon}>☀️ Light</span>
      <span class={classes!.darkIcon}>🌙 Dark</span>
    </button>
  ),
});

// Counter - Now using function-style props! 🎉
defineComponent("counter", {
  styles: {
    container: `{ display: inline-flex; gap: 0.5rem; padding: 1rem; border: 2px solid #007bff; border-radius: 6px; align-items: center; background: white; }`,
    counterButton: `{ padding: 0.5rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; min-width: 2rem; font-weight: bold; }`,
    counterButtonHover: `{ background: #0056b3; }`, // → .counter-button-hover
    display: `{ font-size: 1.5rem; min-width: 3rem; text-align: center; font-weight: bold; color: #007bff; }`
  },
  render: ({
    initialCount = number(0),
    step = number(1)
  }, _api: undefined, classes?: Record<string, string>) => {
    const initial = initialCount as unknown as number;
    const stepN = step as unknown as number;
    return (
      <div class={classes!.container} data-count={initial}>
        <button
          type="button"
          class={classes!.counterButton}
          onclick={updateParentCounter(
            `.${classes!.container}`,
            `.${classes!.display}`,
            -stepN,
          )}
        >
          -{stepN}
        </button>
        <span class={classes!.display}>{initial}</span>
        <button
          type="button"
          class={classes!.counterButton}
          onclick={updateParentCounter(
            `.${classes!.container}`,
            `.${classes!.display}`,
            stepN,
          )}
        >
          +{stepN}
        </button>
        <button
          type="button"
          class={classes!.counterButton}
          onclick={resetCounter(
            `.${classes!.display}`,
            initial,
            `.${classes!.container}`,
          )}
        >
          Reset
        </button>
      </div>
    );
  },
});

// Todo Item - HTMX Integration + Function-style props!
defineComponent("todo-item", {
  api: {
    toggle: patch("/api/todos/:id/toggle", async (req, params) => {
      const form = await req.formData();
      const isDone = form.get("done") === "true";
      return new Response(
        renderComponent("todo-item", {
          id: params.id,
          text: "Task updated!",
          done: !isDone,
        }),
      );
    }),
    remove: del("/api/todos/:id", (_req, _params) => {
      return new Response(null, { status: 200 });
    }),
  },
  styles: {
    item: `{ display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 0.5rem; background: white; transition: background-color 0.2s; }`,
    itemDone: `{ background: #f8f9fa; opacity: 0.8; }`, // Applied conditionally  
    checkbox: `{ margin-right: 0.5rem; }`,
    text: `{ flex: 1; font-size: 1rem; }`,
    textDone: `{ text-decoration: line-through; color: #6c757d; }`, // Applied conditionally
    deleteBtn: `{ background: #dc3545; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; line-height: 1; }`,
    deleteBtnHover: `{ background: #c82333; }` // → .delete-btn-hover
  },
  render: ({
    id = string("1"),
    text = string("Todo item"),
    done = boolean(false)
  }, api: GeneratedApiMap, classes?: Record<string, string>) => {
    const idStr = id as unknown as string;
    const doneBool = done as unknown as boolean;
    const textStr = text as unknown as string;
    const itemClass = `${classes!.item} ${doneBool ? classes!.itemDone : ""}`;
    const textClass = `${classes!.text} ${doneBool ? classes!.textDone : ""}`;
    return (
      <div class={itemClass} data-id={idStr}>
        <input
          type="checkbox"
          class={classes!.checkbox}
          checked={doneBool}
          onChange={syncCheckboxToClass(classes!.itemDone)} // Use the generated class name
          {...api.toggle(idStr)}
        />
        <span class={textClass}>{textStr}</span>
        <button type="button" class={classes!.deleteBtn} {...api.remove(idStr)}>
          ×
        </button>
      </div>
    );
  },
});

// Tabs - Now with function-style props!
defineComponent("tabs", {
  styles: {
    container: `{ border: 1px solid #ddd; border-radius: 6px; overflow: hidden; }`,
    nav: `{ display: flex; background: #f8f9fa; border-bottom: 1px solid #ddd; }`,
    button: `{ flex: 1; padding: 1rem; background: none; border: none; cursor: pointer; font-size: 1rem; transition: background-color 0.2s; }`,
    buttonHover: `{ background: #e9ecef; }`, // → .button-hover
    buttonActive: `{ background: white; border-bottom: 2px solid #007bff; font-weight: 500; color: #007bff; }`, // → .button-active
    content: `{ padding: 1.5rem; min-height: 200px; }`,
    panel: `{ display: none; }`,
    panelActive: `{ display: block; }` // → .panel-active
  },
  render: ({
    tabs = string("Home,About"),
    activeTab = string("Home")
  }, _api: undefined, classes?: Record<string, string>) => {
    const tabsStr = tabs as unknown as string;
    const activeStr = activeTab as unknown as string;
    const tabList = tabsStr.split(",").map((t: string) => t.trim());
    const active = activeStr || tabList[0];

    return (
      <div class={classes!.container}>
        <div class={classes!.nav}>
          {tabList.map((tab: string) => (
            <button
              type="button"
              class={`${classes!.button} ${tab === active ? classes!.buttonActive : ""}`}
              onclick={activateTab(
                `.${classes!.container}`,
                `.${classes!.button}`,
                `.${classes!.content}`,
                classes!.buttonActive,
              )}
              data-tab={tab}
            >
              {tab}
            </button>
          ))}
        </div>
        <div class={classes!.content}>
          {tabList.map((tab: string) => (
            <div
              class={`${classes!.panel} ${tab === active ? classes!.panelActive : ""}`}
              data-tab-content={tab}
            >
              <h3>{tab} Content</h3>
              <p>
                This is the content for the {tab}{" "}
                tab. Each tab can contain different content, components, or
                interactive elements.
              </p>
              {tab === "Settings" && (
                <div>
                  <label>
                    <input type="checkbox" /> Enable notifications
                  </label>
                  <br />
                  <label>
                    <input type="checkbox" /> Auto-save changes
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  },
});

// 🧪 TEST: Function-style Props (NEW!)
defineComponent("function-style-card", {
  styles: {
    container: `{ padding: 1.5rem; border: 2px solid #28a745; border-radius: 8px; margin: 1rem 0; background: #f8fff9; }`,
    title: `{ font-size: 1.25rem; font-weight: bold; color: #155724; margin-bottom: 1rem; }`,
    content: `{ color: #155724; line-height: 1.5; }`,
    highlight: `{ background: #d4edda; padding: 0.5rem; border-radius: 4px; font-family: monospace; }`
  },
  render: ({ 
    title = string("Function-Style Props"),
    count = number(42),
    enabled = boolean(true)
  }, _api: undefined, classes?: Record<string, string>) => {
    const titleStr = title as unknown as string;
    const countN = count as unknown as number;
    const enabledB = enabled as unknown as boolean;
    return (
      <div class={classes!.container}>
        <h3 class={classes!.title}>{titleStr}</h3>
        <div class={classes!.content}>
          <p>🎉 <strong>This component uses function-style props!</strong></p>
          <p>✨ No props transformer defined - props auto-generated from render function parameters</p>
          <p>🔢 Count prop: <span class={classes!.highlight}>{countN}</span></p>
          <p>🎯 Enabled prop: <span class={classes!.highlight}>{enabledB ? "Yes" : "No"}</span></p>
          <p>📝 Title prop: <span class={classes!.highlight}>"{titleStr}"</span></p>
        </div>
      </div>
    );
  },
});

console.log("✅ All examples registered from example.tsx");
