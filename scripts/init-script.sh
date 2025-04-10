#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

SCRIPT_SRC_DIR="src"
VITE_CONFIG="vite.config.ts"

echo ""
echo "--- New Script Initialization ---"
printf "Enter the new script display name (e.g., 'my-awesome-script', uses a-z, 0-9, -): "
read script_display_name

if [ -z "$script_display_name" ]; then
	echo "" >&2
	echo "❌ Error: Script name cannot be empty." >&2
	exit 1
fi

# --- Filename Generation ---
# Generate a safe filename (lowercase, space->hyphen, keep only a-z0-9-)
safe_file_name=$(echo "$script_display_name" | tr '[:upper:]' '[:lower:]' | tr -s ' ' '-' | tr -cd 'a-z0-9-')
final_script_entry_path="${SCRIPT_SRC_DIR}/${safe_file_name}.ts"

echo "    Display Name: '$script_display_name'"
echo "    Safe Filename: '${safe_file_name}.ts'"
echo "    Target Path:   '$final_script_entry_path'"

if [ -z "$safe_file_name" ]; then
	echo "" >&2
	echo "❌ Error: Could not generate a valid safe filename from '$script_display_name'. Please use alphanumeric characters and hyphens." >&2
	exit 1
fi

# --- Check Existing Files ---
if [ -f "$final_script_entry_path" ]; then
	echo "" >&2
	echo "❌ Error: The target script file '$final_script_entry_path' already exists." >&2
    echo "   Please remove it first (you can use 'make remove' or delete it manually) or choose a different script name." >&2
	exit 1
fi

# Less likely, but check for raw name collision if different
temp_script_entry_path="${SCRIPT_SRC_DIR}/${script_display_name}.ts"
if [ "$temp_script_entry_path" != "$final_script_entry_path" ] && [ -f "$temp_script_entry_path" ]; then
    echo "" >&2
    echo "❌ Error: A file with the raw display name '$temp_script_entry_path' already exists." >&2
    echo "   This might be left over from a previous attempt or have special characters." >&2
    echo "   Please remove this file manually before proceeding." >&2
    exit 1;
fi

# --- Create File ---
echo ""
echo "🔧 Creating directory $SCRIPT_SRC_DIR if it doesn't exist..."
mkdir -p "$SCRIPT_SRC_DIR"

echo "🔧 Copying src/main.ts to '$final_script_entry_path'..."
cp src/main.ts "$final_script_entry_path"
if [ $? -ne 0 ]; then
	echo "" >&2
	echo "❌ Error: Failed to copy template file." >&2
	exit 1
fi

# --- Update Vite Config ---
echo "🔧 Updating $VITE_CONFIG (entry, name, description)..."
if [ ! -f "$VITE_CONFIG" ]; then
	echo "" >&2
	echo "❌ Error: $VITE_CONFIG not found." >&2
	rm "$final_script_entry_path" # Clean up created file
	exit 1
fi

# Escape variables for sed replacement (especially paths with /)
escaped_entry=$(echo "$final_script_entry_path" | sed 's/[&\\/\\\\]/\\\\&/g')
escaped_name=$(echo "$script_display_name" | sed 's/[&\\/\\\\]/\\\\&/g') # Less likely to have special chars, but safer
escaped_desc="Enter description for ${script_display_name}"
escaped_desc=$(echo "$escaped_desc" | sed 's/[&\\/\\\\]/\\\\&/g')

# Use sed to replace the lines (modify in place with backup)
# 1. Replace entry line
sed -i.bak "s|^([[:space:]]*entry:[[:space:]]*).*|1${escaped_entry}\',|" "$VITE_CONFIG"
if [ $? -ne 0 ]; then echo "Error updating entry in $VITE_CONFIG" >&2; rm "$final_script_entry_path"; exit 1; fi
# 2. Replace name line
sed -i.bak "s|^([[:space:]]*name:[[:space:]]*).*|1${escaped_name}\',|" "$VITE_CONFIG"
if [ $? -ne 0 ]; then echo "Error updating name in $VITE_CONFIG" >&2; rm "$final_script_entry_path"; exit 1; fi
# 3. Replace description line
sed -i.bak "s|^([[:space:]]*description:[[:space:]]*).*|1${escaped_desc}\',|" "$VITE_CONFIG"
if [ $? -ne 0 ]; then echo "Error updating description in $VITE_CONFIG" >&2; rm "$final_script_entry_path"; exit 1; fi

# Remove backup file if all sed commands succeeded
rm -f "${VITE_CONFIG}.bak"

# --- Success ---
echo "✅ New script '$script_display_name' initialized."
echo "   Entry file: $final_script_entry_path"
echo "   $VITE_CONFIG updated. ❗ Please review and adjust match/grant rules."

# --- Open in VS Code (Optional) ---
if command -v code > /dev/null; then
	echo ""
	echo "Attempting to open '$final_script_entry_path' in the current VS Code window..."
	code -r "$final_script_entry_path"
fi

echo "--------------------------------"
# Removed the explicit exit 0 as set -e handles exits on error 