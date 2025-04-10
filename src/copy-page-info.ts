import { BINDINGS } from "./keybindings"; // Import keybindings

// ==UserScript==
// @name         copy-page-info (Module)
// @namespace    https://github.com/0xfab0131
// @version      0.1.2
// @description  Copies page info (Part of Browser Shortcuts)
// @author       0xfab0131
// @match        *://*/*  <- This @match is informational only for module context
// @grant        GM_setClipboard
// @grant        GM_notification
// @noframes
// ==/UserScript==

// Use an IIFE (Immediately Invoked Function Expression) to encapsulate the logic
// and ensure it runs when the script is imported.
(function () {
  "use strict";
  const SCRIPT_NAME = "Copy Page Info"; // For log prefix
  const LOADED_FLAG = `__${SCRIPT_NAME.replace(
    /\s+/g,
    "_"
  ).toUpperCase()}_LOADED__`; // e.g., __COPY_PAGE_INFO_LOADED__

  // --- Prevent multiple executions ---
  if ((window as any)[LOADED_FLAG]) {
    console.log(`${SCRIPT_NAME}: Already loaded. Skipping initialization.`);
    return; // Exit if already loaded
  }
  (window as any)[LOADED_FLAG] = true;
  // --- End of addition ---

  console.log(`${SCRIPT_NAME}: Module Loaded. Initializing...`);

  /**
   * クリップボードにテキストをコピーし、通知を表示する関数
   * @param text コピーするテキスト
   * @param formatType コピーした形式（通知用）
   */
  const copyToClipboard = (text: string, formatType: string) => {
    console.log(`${SCRIPT_NAME}: Attempting to copy as ${formatType}...`);
    if (!text) {
      console.warn(`${SCRIPT_NAME}: Text to copy is empty.`);
      try {
        // Still try notification even if text is empty
        GM_notification({
          title: "Copy Failed",
          text: "No content found to copy.",
          timeout: 1500,
        });
      } catch (e) {
        console.error("Failed notification:", e);
      }
      return;
    }
    try {
      // Use GM_setClipboard
      GM_setClipboard(text, "text");
      console.log(`${SCRIPT_NAME}: Clipboard set successfully.`);
      // Use GM_notification
      GM_notification({
        title: "Page Info Copied!",
        text: `Copied as ${formatType}`,
        timeout: 1500,
      });
      console.log(`${SCRIPT_NAME}: Copied as ${formatType}:\n${text}`);
    } catch (e) {
      console.error(`${SCRIPT_NAME}: Failed to copy or notify:`, e);
      alert(`[${SCRIPT_NAME}] Failed to copy to clipboard. See console.`);
    }
  };

  /**
   * ページ情報を取得する関数
   * @returns ページ情報のオブジェクト
   */
  const getPageInfo = () => {
    console.log(`${SCRIPT_NAME}: Getting page info...`);
    const title = document.title?.trim() ?? "";
    const url = location.href;
    console.log(`${SCRIPT_NAME}: Found URL: ${url}`); // Log URL immediately

    // Helper to get meta content
    const getMetaContent = (selector: string): string => {
      const element = document.querySelector<HTMLMetaElement>(selector);
      const content = element?.content?.trim() ?? "";
      // console.log(`${SCRIPT_NAME}: Meta '${selector}': ${content || '(not found)'}`); // Optional detailed meta logging
      return content;
    };

    const description = getMetaContent('meta[name="description"]');
    const ogTitle = getMetaContent('meta[property="og:title"]') || title; // Fallback to title
    const ogDescription =
      getMetaContent('meta[property="og:description"]') || description; // Fallback to description
    const ogUrl = getMetaContent('meta[property="og:url"]') || url; // Fallback to url

    const pageInfo = {
      title,
      url,
      description,
      ogTitle,
      ogDescription,
      ogUrl,
    };
    console.log(`${SCRIPT_NAME}: Page info gathered:`, pageInfo);
    return pageInfo;
  };

  /**
   * 基本情報 (タイトルとURL) をコピーする関数
   */
  const copyBasicInfo = () => {
    console.log(`${SCRIPT_NAME}: copyBasicInfo called.`);
    const pageInfo = getPageInfo();
    // Use OGP title if available and different, otherwise use document title
    const displayTitle = pageInfo.ogTitle || pageInfo.title || "No Title";
    const text = `[${displayTitle}](${pageInfo.url})`;
    console.log(`${SCRIPT_NAME}: Basic text to copy: ${text}`);
    copyToClipboard(text, "Basic Link");
  };

  /**
   * 詳細情報 (Markdown形式) をコピーする関数
   */
  const copyMarkdownInfo = () => {
    console.log(`${SCRIPT_NAME}: copyMarkdownInfo called.`);
    const pageInfo = getPageInfo();

    // Prefer OGP data, fallback to standard meta/title/url
    const displayTitle = pageInfo.ogTitle || pageInfo.title || "No Title";
    const displayUrl = pageInfo.ogUrl || pageInfo.url; // Often the same, but OGP might be canonical
    const displayDescription = pageInfo.ogDescription || pageInfo.description;

    let markdown = `# [${displayTitle}](${displayUrl})\n\n`;

    if (displayDescription) {
      markdown += `## Description\n${displayDescription.replace(
        /\n/g,
        "\n> "
      )}\n\n`; // Quote multiline descriptions
    } else if (pageInfo.description) {
      // Fallback if OGP description missing but standard is present
      markdown += `## Description\n${pageInfo.description.replace(
        /\n/g,
        "\n> "
      )}\n\n`;
    }

    markdown += `## Details\n`;
    markdown += `- **URL:** <${pageInfo.url}>\n`; // Use < > for raw URL to avoid markdown interpretation
    // Show original title only if it differs from the displayed (OGP) title
    if (pageInfo.title && pageInfo.title !== displayTitle) {
      markdown += `- **Original Title:** ${pageInfo.title}\n`;
    }
    // Show original description only if it differs (and exists)
    if (pageInfo.description && pageInfo.description !== displayDescription) {
      markdown += `- **Meta Description:** ${pageInfo.description}\n`;
    }
    console.log(`${SCRIPT_NAME}: Markdown text to copy:\n${markdown.trim()}`);
    copyToClipboard(markdown.trim(), "Markdown Details");
  };

  // --- Keyboard Event Listener ---
  const handleKeyDown = (event: KeyboardEvent) => {
    // Helper to check modifiers (Ctrl, Alt, Shift, Meta)
    const checkModifiers = (binding: string | null): boolean => {
      if (!binding) return false;
      const parts = binding.toUpperCase().split("+");
      const key = parts.pop(); // Last part is the key
      if (!key || key !== event.key.toUpperCase()) return false;

      const ctrl = parts.includes("CTRL");
      const alt = parts.includes("ALT");
      const shift = parts.includes("SHIFT");
      const meta = parts.includes("META"); // Command key on Mac

      const match =
        event.ctrlKey === ctrl &&
        event.altKey === alt &&
        event.shiftKey === shift &&
        event.metaKey === meta;
      // if (match) console.log(`${SCRIPT_NAME}: Modifier check PASSED for ${binding}`); // Verbose log
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

  // --- Initialization ---
  const listenerKey = `__${SCRIPT_NAME}_KEYDOWN_LISTENER__`;
  const existingListener = (window as any)[listenerKey];
  if (existingListener) {
    document.removeEventListener("keydown", existingListener, true);
    console.log(`${SCRIPT_NAME}: Removed previous keydown listener.`);
  }
  document.addEventListener("keydown", handleKeyDown, true); // Use capture phase
  (window as any)[listenerKey] = handleKeyDown; // Store listener reference

  console.log(
    `${SCRIPT_NAME}: Initialized. Basic: ${BINDINGS.COPY_PAGE_INFO_BASIC}, Markdown: ${BINDINGS.COPY_PAGE_INFO_MARKDOWN}`
  );
})(); // End of IIFE
