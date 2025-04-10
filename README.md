# Tampermonkey Script Development Template (Vite + TypeScript + Docker)

This repository serves as a template for developing Tampermonkey Userscripts using Vite, TypeScript, and Docker, enabling an efficient, type-safe, and consistent workflow across different environments.

[日本語 (Japanese)](./README.ja.md)

## ✨ Quick Start for Developers

**Prerequisites:** Docker and Docker Compose installed.

1.  **Clone or Use Template:**
    - Click the "Use this template" button on GitHub OR
    - Clone the repository: `git clone git@github.com:0xfab0131/browser-shortcuts.git`
    - `cd browser-shortcuts`
2.  **Install Dependencies (Builds Docker image):**
    ```bash
    make build # Run build once to ensure image is ready
    # OR start dev server which also builds:
    # make dev
    ```
3.  **Initialize (Optional - for a new script):**
    ```bash
    make init # Follow the interactive prompts
    ```
4.  **Development (Hot-Reload, NO GM\_\* APIs):**
    ```bash
    make dev
    ```
    - Install the `....proxy.user.js` from console URL into Tampermonkey.
    - Edit files in `./src`. Changes hot-reload.
    - **Limitation:** `GM_*` APIs (e.g., `GM_setClipboard`) likely **won't work** here.
5.  **Testing GM\_\* APIs (Manual Update):**
    ```bash
    make build
    ```
    - Disable/Remove the proxy script in Tampermonkey.
    - Install the generated `dist/tampermonkey-scripts.user.js` manually.
    - Test GM functions on target pages.
    - To iterate: Edit code -> `make build` -> Update script in Tampermonkey.

## ⭐ Features

- **Consistent Environment** with Docker.
- **Simplified Workflow** using Makefile (`make dev`, `make init`, `make build`, `make remove`).
- **Fast development server and build** powered by Vite.
- **Type-safe development** with TypeScript.
- **Centralized Keybinding Management** in `src/keybindings.ts`.
- **Example Scripts:**
  - Copy Page Info (`Ctrl+Alt+U` / `Ctrl+Alt+I`)
  - New LibreChat Prompt (`Ctrl+Alt+L`)
- **Easy Userscript metadata management** using `vite-plugin-monkey`.
- **Efficient development workflow** with local hot-reloading (for non-GM parts via Docker volume mounts).
- **Clear project structure** ready for your script.
- **Port conflict detection** on `make dev`.

## 🚀 Usage Details

### Prerequisites

- Docker ([Install Docker](https://docs.docker.com/engine/install/))
- Docker Compose ([Install Docker Compose](https://docs.docker.com/compose/install/))
- Tampermonkey browser extension

### Makefile Commands

- `make help`: Show available commands.
- `make dev`: Start the development server (for UI/logic dev, GM APIs likely broken).
- `make stop`: Stop the development server container.
- `make logs`: Tail the logs of the development server container.
- `make init`: Interactively initialize a new script based on `src/template.user.ts`.
- `make remove`: Interactively remove a script file from the `src` directory.
- `make build`: Build the production-ready userscript (needed for testing GM APIs).
- `make clean`: Remove the `dist` directory and optionally node_modules/containers.
- `make rebuild`: Force rebuild the Docker image and restart the dev server.

### Development Workflow Explained

This project uses a two-phase development approach due to limitations with `GM_*` API access in the Vite development proxy environment:

1.  **Phase 1: Core Logic & UI Development (`make dev`)**

    - Run `make dev` for features that **do not** rely on `GM_setClipboard`, `GM_notification`, `GM_xmlHttpRequest`, etc.
    - Install the `*.proxy.user.js` script from the console URL into Tampermonkey.
    - Edit your `.ts` files in `./src`. Changes will hot-reload in the browser, allowing for rapid UI and logic iteration.
    - **Important:** When working on code that _will_ use `GM_*` APIs, temporarily replace the calls with `console.log` or comment them out during this phase, as they will likely cause `ReferenceError`s if executed.

2.  **Phase 2: GM API Testing & Final Debugging (`make build`)**
    - When you need to test or debug functionality involving `GM_*` APIs:
      a. Run `make build`. This generates the final userscript in `./dist`.
      b. In the Tampermonkey Dashboard, **disable or remove** the `*.proxy.user.js` development script.
      c. Manually install the generated **`dist/tampermonkey-scripts.user.js`** (or `dist/main.user.js`) file into Tampermonkey.
      d. Reload the target page and test the `GM_*` functionality.
      e. If modifications are needed: Edit the code in `./src`, **repeat step (a) (`make build`)**, and then **manually update** the script in Tampermonkey (usually by editing the installed script and pasting the new code from the `.user.js` file).

### Building the Production Script

- Run `make build`. The final installable script will be in the `./dist` directory (`<package-name>.user.js` and `<package-name>.meta.js`).
- You can install the `.user.js` file manually in Tampermonkey.
- **Auto-update:** If you host the `dist` folder contents (e.g., via GitHub Pages or raw commit access) and install the script from the hosted `.user.js` URL, Tampermonkey will automatically check for updates using the `@updateURL` (pointing to the `.meta.js`) defined in the script's metadata.

## 📁 Project Structure

```
browser-shortcuts/
├── dist/             # Build output directory (created by 'make build')
├── src/
│   ├── main.ts       # Main entry point (imports other scripts)
│   ├── copy-page-info.ts # Example feature script
│   ├── librechat-new.ts  # Example LibreChat script
│   ├── template.user.ts # Template for `make init`
│   └── keybindings.ts  # Central keybinding configuration
├── .dockerignore     # Files excluded from Docker build context
├── .gitignore        # Git ignore configuration
├── Dockerfile        # Defines Docker images for dev and build
├── docker-compose.yml # Defines the development service
├── Makefile          # Provides simple commands (dev, build, init, remove, etc.)
├── package.json      # Project configuration
├── README.md         # This documentation (English)
├── README.ja.md      # Documentation (Japanese)
├── tsconfig.json     # TypeScript configuration
└── vite.config.ts    # Vite configuration (includes Userscript metadata)
```

## 🛡️ Security Considerations

- **Minimize Permissions:** Grant only the necessary `GM_*` permissions in `vite.config.ts` (`userscript.grant`).
- **External Libraries:** Be cautious when using external libraries. Ensure they are from trusted sources.
- **Sensitive Information:** Avoid storing sensitive data directly in the script. Use Tampermonkey's secure storage (`GM_setValue`/`GM_getValue`).

## ❤️ Support the Project

If you find this template helpful or use the scripts developed from it, consider showing your support!

- **⭐ Star the repository** on GitHub.
- **(Optional) Sponsor the developer:**
  - [![GitHub Sponsors](https://img.shields.io/github/sponsors/0xfab0131?style=social)](https://github.com/sponsors/0xfab0131)
  - _[Add other donation links here if desired (e.g., Patreon, Ko-fi)]_

Your support helps maintain and improve this project. Thank you! 🙏

## 📜 License

Please refer to the LICENSE file in the root of the repository (`git@github.com:0xfab0131/browser-shortcuts.git`).
