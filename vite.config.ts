import { defineConfig } from "vite";
import monkey, { cdn } from "vite-plugin-monkey";
import path from "path";
import pkg from "./package.json"; // package.json をインポート

// スクリプトのベース名 (package.json の name から取得)
const scriptBaseName = pkg.name || "tampermonkey-scripts"; // フォールバック
// GitHub Raw URL のベース (ユーザー名とリポジトリ名を適切に設定)
const githubRepoBase =
  "https://raw.githubusercontent.com/0xfab0131/browser-shortcuts/main"; // mainブランチの場合

// --- Generate dynamic version based on build time ---
// Format: YYYY.MMDD.HHMMSS (e.g., 2025.0411.143055)
const now = new Date();
const versionString = `${now.getFullYear()}.${(now.getMonth() + 1)
  .toString()
  .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}.${now
  .getHours()
  .toString()
  .padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}${now
  .getSeconds()
  .toString()
  .padStart(2, "0")}`;
console.log(`[vite.config.ts] Generated version string: ${versionString}`); // Log the generated version
// --- End of version generation ---

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  // --- Development Server Configuration ---
  server: {
    host: "0.0.0.0", // Allow access from outside the container
    port: 5173, // Fixed port for easier access
    strictPort: true, // Ensure this port is used
  },
  plugins: [
    monkey({
      // --- Script Entry Point ---
      entry: "src/main.ts", // Consolidated entry point

      // --- Userscript Metadata ---
      userscript: {
        // --- Basic Info (from package.json) ---
        name: "Browser Shortcuts (All-in-One)", // Keep a user-friendly name here
        namespace: "https://github.com/0xfab0131",
        // --- Use dynamic version ---
        version: versionString, // Use the generated date/time string
        description: pkg.description, // Use description from package.json
        author: pkg.author, // Use author from package.json

        // --- Update/Download URLs ---
        updateURL: `${githubRepoBase}/dist/${scriptBaseName}.meta.js`,
        downloadURL: `${githubRepoBase}/dist/${scriptBaseName}.user.js`,

        // --- Execution Rules ---
        // ❗ Define match patterns covering ALL included scripts
        match: ["*://*/*"], // Start broad, refine later if possible

        // --- Visuals ---
        icon: "https://vitejs.dev/logo.svg",

        // --- Permissions ---
        // ❗ Define ALL grants needed by ANY included script
        grant: [
          "GM_setClipboard",
          "GM_notification",
          // 'GM_addStyle', // Add back if any script needs it
          // Add other grants as needed by future scripts
        ],
      },

      // --- Build Configuration ---
      build: {
        fileName: `${scriptBaseName}.user.js`, // Set output filename based on package name
        metaFileName: true, // Generate a separate .meta.js file

        // --- External Libraries (Optional) ---
        // Use this if you want to load libraries like Vue or React from a CDN instead of bundling.
        // externalGlobals: {
        //   vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js'),
        // },
      },
    }),
  ],
});
