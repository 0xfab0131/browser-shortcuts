// src/librechat-new.ts
import { BINDINGS } from "./keybindings";

// ==UserScript==
// @name         LibreChat New Prompt Starter (Module)
// @namespace    https://github.com/0xfab0131
// @version      0.1.0 // Initial version for this module
// @description  Opens LibreChat in a new tab with a query parameter for the prompt via shortcut.
// @author       0xfab0131
// @match        *://*/* // This script needs to run everywhere to catch the shortcut
// @grant        GM_openInTab
// @noframes
// ==/UserScript==

(function () {
  "use strict";

  const SCRIPT_NAME = "LibreChat New Prompt";
  const LOADED_FLAG = `__${SCRIPT_NAME.replace(
    /\s+/g,
    "_"
  ).toUpperCase()}_LOADED__`;
  // ❗ Configure your LibreChat base URL here!
  const LIBRECHAT_BASE_URL = "https://librechat-fab0131.up.railway.app/c/new"; // Example: Replace with your actual URL

  if ((window as any)[LOADED_FLAG]) {
    console.log(`${SCRIPT_NAME}: Already loaded. Skipping initialization.`);
    return;
  }
  (window as any)[LOADED_FLAG] = true;

  console.log(`${SCRIPT_NAME}: Initializing...`);

  /**
   * Prompts user for input and opens LibreChat with the prompt.
   */
  const openNewLibreChatPrompt = () => {
    console.log(`${SCRIPT_NAME}: Shortcut triggered.`);
    const promptText = prompt("Enter the prompt for LibreChat:", "");

    if (promptText === null) {
      // User cancelled the prompt
      console.log(`${SCRIPT_NAME}: Prompt cancelled by user.`);
      return;
    }

    if (promptText.trim() === "") {
      console.log(
        `${SCRIPT_NAME}: Prompt is empty, opening LibreChat without prompt.`
      );
      // Open base URL if prompt is empty
      GM_openInTab(LIBRECHAT_BASE_URL, { active: true });
    } else {
      // URL-encode the prompt text
      const encodedPrompt = encodeURIComponent(promptText);
      const targetUrl = `${LIBRECHAT_BASE_URL}?prompt=${encodedPrompt}`;
      console.log(`${SCRIPT_NAME}: Opening URL: ${targetUrl}`);
      // Open LibreChat with the prompt parameter in a new active tab
      GM_openInTab(targetUrl, { active: true }); // active: true makes the new tab focused
    }
  };

  // --- Keyboard Event Listener ---
  const handleKeyDown = (event: KeyboardEvent) => {
    const checkModifiers = (binding: string | null): boolean => {
      if (!binding) return false;
      const parts = binding.toUpperCase().split("+");
      const key = parts.pop();
      if (!key || key !== event.key.toUpperCase()) return false;
      const ctrl = parts.includes("CTRL");
      const alt = parts.includes("ALT");
      const shift = parts.includes("SHIFT");
      const meta = parts.includes("META");
      return (
        event.ctrlKey === ctrl &&
        event.altKey === alt &&
        event.shiftKey === shift &&
        event.metaKey === meta
      );
    };

    if (checkModifiers(BINDINGS.OPEN_LIBRECHAT_NEW_PROMPT)) {
      console.log(
        `${SCRIPT_NAME}: Shortcut detected! (${BINDINGS.OPEN_LIBRECHAT_NEW_PROMPT})`
      );
      event.preventDefault();
      event.stopPropagation();
      openNewLibreChatPrompt();
    }
  };

  // --- Initialization ---
  const listenerKey = `__${SCRIPT_NAME}_KEYDOWN_LISTENER__`;
  const existingListener = (window as any)[listenerKey];
  if (existingListener) {
    document.removeEventListener("keydown", existingListener, true);
    console.log(`${SCRIPT_NAME}: Removed previous keydown listener.`);
  }
  document.addEventListener("keydown", handleKeyDown, true);
  (window as any)[listenerKey] = handleKeyDown;

  console.log(
    `${SCRIPT_NAME}: Initialized. Shortcut: ${BINDINGS.OPEN_LIBRECHAT_NEW_PROMPT}`
  );
})();
