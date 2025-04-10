// src/template.user.ts - Template for new scripts created by 'make init'

// ==UserScript==
// @name         New Script Name (Update Me)
// @namespace    https://github.com/0xfab0131
// @version      0.1.0
// @description  Enter script description here
// @author       0xfab0131
// @match        *://*/*  // ❗ Adjust match patterns
// @grant        none     // ❗ Add necessary GM grants
// @noframes
// ==/UserScript==

(function () {
  "use strict";

  const SCRIPT_NAME = "New Script Name (Update Me)"; // ❗ Update script name
  const LOADED_FLAG = `__${SCRIPT_NAME.replace(
    /\s+/g,
    "_"
  ).toUpperCase()}_LOADED__`;

  // --- Prevent multiple executions ---
  if ((window as any)[LOADED_FLAG]) {
    console.log(`${SCRIPT_NAME}: Already loaded. Skipping initialization.`);
    return; // Exit if already loaded
  }
  (window as any)[LOADED_FLAG] = true;

  console.log(`${SCRIPT_NAME}: Initializing...`);

  // --- Your Code Here ---

  // Example: Add a menu command
  // GM_registerMenuCommand('Show Alert', () => {
  //     alert('Hello from New Script!');
  // });

  // --- Initialization ---
  // Add event listeners or other setup logic here

  console.log(`${SCRIPT_NAME}: Initialized.`);
})();
