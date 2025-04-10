# Variables
COMPOSE = docker compose
SERVICE_NAME = dev
CONTAINER_NAME = tampermonkey_dev
SCRIPT_SRC_DIR = src
DEV_PORT = 5173

# Default command (show help)
.DEFAULT_GOAL := help

## ---------------------------------------
## Development Commands
## ---------------------------------------

dev: ## Start the development server with hot-reloading
	@# Check if DEV_PORT is in use
	@if ss -tuln | grep -q ":$(DEV_PORT) " ; then \
		echo "\n⚠️ Port $(DEV_PORT) seems to be in use."; \
		printf "Stop the existing container/process on port $(DEV_PORT) (make stop)? (y/N) "; \
		read confirm; \
		if [ "$${confirm:-N}" = "y" ] || [ "$${confirm:-N}" = "Y" ]; then \
			make --no-print-directory stop; \
		else \
			echo "❌ Aborting. Please free up port $(DEV_PORT) or stop the existing container manually."; \
			exit 1; \
		fi; \
	fi
	@echo "\n🚀 Starting development server..."
	$(COMPOSE) up -d --build $(SERVICE_NAME)
	@echo "\n----------------------------------------------------"
	@echo "✅ Development server started."
	@echo "👀 Watching for file changes in ./src and ./vite.config.ts ..."
	@echo "👉 Access the proxy script for Tampermonkey via:"
	@echo "   (Check container logs for the exact URL if needed: make logs)"
	@# Simpler way to get the entry script base name (without path/extension)
	@entry_script_path=$$(grep -o "entry: *'src/[^']*.ts'" vite.config.ts | sed "s/entry: *'src\\///; s/\\.ts'//"); \
	 echo "   Expected URL Hint: http://localhost:$(DEV_PORT)/$${entry_script_path:-main}.proxy.user.js"
	@echo "   (Actual URL will be shown in the container logs below)" # Add clarification
	@echo "🔧 Edit files locally in ./src - changes will hot-reload."
	@echo "🛑 To stop the server, run: make stop"
	@echo "----------------------------------------------------\n"
	@echo "(Showing container logs - Press Ctrl+C to stop viewing logs but keep server running)"
	@# Make sure the container is fully up before tailing logs
	@sleep 1
	@$(COMPOSE) logs -f $(SERVICE_NAME)

stop: ## Stop the development server
	@echo "Stopping development server..."
	$(COMPOSE) down
	@echo "✅ Development server stopped."

logs: ## Show logs from the development server container
	@echo "Showing logs for $(CONTAINER_NAME)... (Press Ctrl+C to stop)"
	@$(COMPOSE) logs -f $(SERVICE_NAME)

## ---------------------------------------
## Script Management Commands
## ---------------------------------------

init: ## Initialize a new script based on src/main.ts (interactive)
	@./scripts/init-script.sh

remove: ## Remove a script file (interactive)
	@echo "\n--- Remove Script ---"
	@echo "Available scripts in $(SCRIPT_SRC_DIR)/:"
	@ls -1 $(SCRIPT_SRC_DIR)/*.ts 2>/dev/null | cat -n || { echo "No scripts found in $(SCRIPT_SRC_DIR)/."; exit 1; }
	@printf "\nEnter the number of the script file to remove: "
	@read script_num; \
	script_to_remove=$$(ls -1 $(SCRIPT_SRC_DIR)/*.ts 2>/dev/null | sed -n "$${script_num}p"); \
	if [ -z "$$script_to_remove" ] || [ ! -f "$$script_to_remove" ]; then \
		echo "\n❌ Error: Invalid selection or file not found."; \
		exit 1; \
	fi;
	@# Get the current entry from vite.config.ts
	@current_entry=$$(awk '/entry:/ {gsub(/[\"'\'\',]/, \"\", $$2); print $$2; exit}' vite.config.ts);
	@if [ "$$script_to_remove" = "$$current_entry" ]; then \
		echo "\n⚠️ Warning: You are about to remove the script currently set as the entry point in vite.config.ts ('$$current_entry')."; \
	fi;
	@printf "Are you sure you want to permanently delete '\033[1;31m%s\033[0m'? (y/N) " "$$script_to_remove"
	@read confirm_delete; \
	if [ "$${confirm_delete:-N}" = "y" ] || [ "$${confirm_delete:-N}" = "Y" ]; then \
		echo "\n🗑️ Removing file: $$script_to_remove"; \
		rm "$$script_to_remove"; \
		echo "✅ File removed."; \
		if [ "$$script_to_remove" = "$$current_entry" ]; then \
			echo "❗ Important: Please update 'vite.config.ts' to set a new 'entry' point (e.g., 'src/main.ts') and adjust metadata."; \
		else \
			echo "❗ Remember to update 'vite.config.ts' if this script was referenced indirectly."; \
		fi; \
	else \
		echo "Aborted."; \
	fi
	@echo "---------------------"

## ---------------------------------------
## Build Command
## ---------------------------------------

build: ## Build the script for production
	@echo "Building the script using Docker Compose..."
	@# Ensure the image is built (Compose handles caching)
	$(COMPOSE) build $(SERVICE_NAME)
	@echo "Running build command via docker compose run (as container default user)..."
	@# Run the build command within the 'dev' service context
	@# Explicitly mount the dist directory to get build artifacts on the host
	$(COMPOSE) run --rm \
	  -w /app \
	  -v "$(shell pwd)/dist:/app/dist" \
	  $(SERVICE_NAME) \
	  pnpm run build
	@echo "\n✅ Build complete. Output files should be in the ./dist directory."
	@echo "   If file permissions are incorrect in ./dist, run: sudo chown $(shell id -u):$(shell id -g) -R dist"
	@echo "   Install the .user.js file in Tampermonkey."

## ---------------------------------------
## Utility Commands
## ---------------------------------------

clean: ## Remove build artifacts and potentially node_modules (use with caution)
	@echo "Cleaning up build artifacts (./dist)..."
	rm -rf dist
	@printf "Also remove node_modules and stop/remove containers? (y/N) "
	@read confirm_clean_all; \
	if [ "$${confirm_clean_all:-N}" = "y" ] || [ "$${confirm_clean_all:-N}" = "Y" ]; then \
		echo "Stopping containers and removing volumes/node_modules..."; \
		$(COMPOSE) down -v --remove-orphans; \
		rm -rf node_modules; \
		echo "✅ Full cleanup complete."; \
	else \
		echo "✅ Cleaned ./dist. Kept node_modules and containers."; \
	fi

rebuild: ## Force rebuild of the Docker image and restart dev server
	@echo "Stopping existing containers..."
	$(COMPOSE) down
	@echo "Forcing rebuild of the Docker image..."
	$(COMPOSE) build --no-cache $(SERVICE_NAME)
	@echo "Restarting development server..."
	make --no-print-directory dev

help: ## Show this help message
	@echo "Usage: make [command]"
	@echo ""
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

.PHONY: dev stop logs init remove build clean rebuild help check_port 