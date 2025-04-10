// ==UserScript==
// @name         Browser Shortcuts (All-in-One)
// @namespace    https://github.com/0xfab0131
// @version      2025.0410.164847
// @author       0xfab0131
// @description  Tampermonkey scripts collection developed with Vite and TypeScript
// @license      UNLICENSED
// @icon         https://vitejs.dev/logo.svg
// @homepage     https://github.com/0xfab0131/browser-shortcuts#readme
// @homepageURL  https://github.com/0xfab0131/browser-shortcuts#readme
// @source       https://github.com/0xfab0131/browser-shortcuts.git
// @supportURL   https://github.com/0xfab0131/browser-shortcuts/issues
// @downloadURL  https://raw.githubusercontent.com/0xfab0131/browser-shortcuts/main/dist/tampermonkey-scripts.user.js
// @updateURL    https://raw.githubusercontent.com/0xfab0131/browser-shortcuts/main/dist/tampermonkey-scripts.meta.js
// @match        *://*/*
// @grant        GM_notification
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
  'use strict';

  const BINDINGS = {
    // --- copy-page-info ---
    /** Copies basic page info (Title + URL) */
    COPY_PAGE_INFO_BASIC: "Ctrl+Alt+U",
    /** Copies detailed page info (Markdown) */
    COPY_PAGE_INFO_MARKDOWN: "Ctrl+Alt+I"
    // --- Add other script bindings here ---
    // EXAMPLE_FEATURE_TOGGLE: 'Alt+Shift+T',
    // ANOTHER_ACTION: null, // Disabled by default
  };
  (function() {
    const SCRIPT_NAME = "Copy Page Info";
    const LOADED_FLAG = `__${SCRIPT_NAME.replace(
    /\s+/g,
    "_"
  ).toUpperCase()}_LOADED__`;
    if (window[LOADED_FLAG]) {
      console.log(`${SCRIPT_NAME}: Already loaded. Skipping initialization.`);
      return;
    }
    window[LOADED_FLAG] = true;
    console.log(`${SCRIPT_NAME}: Module Loaded. Initializing...`);
    const copyToClipboard = (text, formatType) => {
      console.log(`${SCRIPT_NAME}: Attempting to copy as ${formatType}...`);
      if (!text) {
        console.warn(`${SCRIPT_NAME}: Text to copy is empty.`);
        try {
          GM_notification({
            title: "Copy Failed",
            text: "No content found to copy.",
            timeout: 1500
          });
        } catch (e) {
          console.error("Failed notification:", e);
        }
        return;
      }
      try {
        GM_setClipboard(text, "text");
        console.log(`${SCRIPT_NAME}: Clipboard set successfully.`);
        GM_notification({
          title: "Page Info Copied!",
          text: `Copied as ${formatType}`,
          timeout: 1500
        });
        console.log(`${SCRIPT_NAME}: Copied as ${formatType}:
${text}`);
      } catch (e) {
        console.error(`${SCRIPT_NAME}: Failed to copy or notify:`, e);
        alert(`[${SCRIPT_NAME}] Failed to copy to clipboard. See console.`);
      }
    };
    const getPageInfo = () => {
      var _a;
      console.log(`${SCRIPT_NAME}: Getting page info...`);
      const title = ((_a = document.title) == null ? void 0 : _a.trim()) ?? "";
      const url = location.href;
      console.log(`${SCRIPT_NAME}: Found URL: ${url}`);
      const getMetaContent = (selector) => {
        var _a2;
        const element = document.querySelector(selector);
        const content = ((_a2 = element == null ? void 0 : element.content) == null ? void 0 : _a2.trim()) ?? "";
        return content;
      };
      const description = getMetaContent('meta[name="description"]');
      const ogTitle = getMetaContent('meta[property="og:title"]') || title;
      const ogDescription = getMetaContent('meta[property="og:description"]') || description;
      const ogUrl = getMetaContent('meta[property="og:url"]') || url;
      const pageInfo = {
        title,
        url,
        description,
        ogTitle,
        ogDescription,
        ogUrl
      };
      console.log(`${SCRIPT_NAME}: Page info gathered:`, pageInfo);
      return pageInfo;
    };
    const copyBasicInfo = () => {
      console.log(`${SCRIPT_NAME}: copyBasicInfo called.`);
      const pageInfo = getPageInfo();
      const displayTitle = pageInfo.ogTitle || pageInfo.title || "No Title";
      const text = `[${displayTitle}](${pageInfo.url})`;
      console.log(`${SCRIPT_NAME}: Basic text to copy: ${text}`);
      copyToClipboard(text, "Basic Link");
    };
    const copyMarkdownInfo = () => {
      console.log(`${SCRIPT_NAME}: copyMarkdownInfo called.`);
      const pageInfo = getPageInfo();
      const displayTitle = pageInfo.ogTitle || pageInfo.title || "No Title";
      const displayUrl = pageInfo.ogUrl || pageInfo.url;
      const displayDescription = pageInfo.ogDescription || pageInfo.description;
      let markdown = `# [${displayTitle}](${displayUrl})

`;
      if (displayDescription) {
        markdown += `## Description
${displayDescription.replace(
        /\n/g,
        "\n> "
      )}

`;
      } else if (pageInfo.description) {
        markdown += `## Description
${pageInfo.description.replace(
        /\n/g,
        "\n> "
      )}

`;
      }
      markdown += `## Details
`;
      markdown += `- **URL:** <${pageInfo.url}>
`;
      if (pageInfo.title && pageInfo.title !== displayTitle) {
        markdown += `- **Original Title:** ${pageInfo.title}
`;
      }
      if (pageInfo.description && pageInfo.description !== displayDescription) {
        markdown += `- **Meta Description:** ${pageInfo.description}
`;
      }
      console.log(`${SCRIPT_NAME}: Markdown text to copy:
${markdown.trim()}`);
      copyToClipboard(markdown.trim(), "Markdown Details");
    };
    const handleKeyDown = (event) => {
      const checkModifiers = (binding) => {
        if (!binding) return false;
        const parts = binding.toUpperCase().split("+");
        const key = parts.pop();
        if (!key || key !== event.key.toUpperCase()) return false;
        const ctrl = parts.includes("CTRL");
        const alt = parts.includes("ALT");
        const shift = parts.includes("SHIFT");
        const meta = parts.includes("META");
        const match = event.ctrlKey === ctrl && event.altKey === alt && event.shiftKey === shift && event.metaKey === meta;
        return match;
      };
      if (checkModifiers(BINDINGS.COPY_PAGE_INFO_BASIC)) {
        console.log(
          `${SCRIPT_NAME}: Basic Copy shortcut detected! (${BINDINGS.COPY_PAGE_INFO_BASIC})`
        );
        event.preventDefault();
        event.stopPropagation();
        copyBasicInfo();
      } else if (checkModifiers(BINDINGS.COPY_PAGE_INFO_MARKDOWN)) {
        console.log(
          `${SCRIPT_NAME}: Markdown Copy shortcut detected! (${BINDINGS.COPY_PAGE_INFO_MARKDOWN})`
        );
        event.preventDefault();
        event.stopPropagation();
        copyMarkdownInfo();
      }
    };
    const listenerKey = `__${SCRIPT_NAME}_KEYDOWN_LISTENER__`;
    const existingListener = window[listenerKey];
    if (existingListener) {
      document.removeEventListener("keydown", existingListener, true);
      console.log(`${SCRIPT_NAME}: Removed previous keydown listener.`);
    }
    document.addEventListener("keydown", handleKeyDown, true);
    window[listenerKey] = handleKeyDown;
    console.log(
      `${SCRIPT_NAME}: Initialized. Basic: ${BINDINGS.COPY_PAGE_INFO_BASIC}, Markdown: ${BINDINGS.COPY_PAGE_INFO_MARKDOWN}`
    );
  })();
  console.log("Browser Shortcuts (All-in-One) Loaded.");

})();