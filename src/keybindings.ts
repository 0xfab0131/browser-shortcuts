/**
 * Keybinding configuration for all scripts.
 * Use descriptive names and ensure uniqueness.
 * Modifier order: Ctrl+Alt+Shift+Meta+Key (e.g., 'Ctrl+Shift+C')
 * Use `null` to disable a specific binding.
 */
export const BINDINGS = {
  // --- copy-page-info ---
  /** Copies basic page info (Title + URL) */
  COPY_PAGE_INFO_BASIC: "Ctrl+Alt+U",
  /** Copies detailed page info (Markdown) */
  COPY_PAGE_INFO_MARKDOWN: "Ctrl+Alt+I",

  // --- librechat-new ---
  /** Opens LibreChat with a new prompt */
  OPEN_LIBRECHAT_NEW_PROMPT: "Ctrl+Alt+L",

  // --- Add other script bindings here ---
  // EXAMPLE_FEATURE_TOGGLE: 'Alt+Shift+T',
  // ANOTHER_ACTION: null, // Disabled by default
} as const; // `as const` makes the object readonly and keys/values literal types
