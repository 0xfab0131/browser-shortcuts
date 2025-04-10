const fs = require("fs");
const path = require("path");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});
const { exec } = require("child_process");

const SRC_DIR = "src";
const TEMPLATE_FILE = path.join(SRC_DIR, "main.ts");
const VITE_CONFIG = "vite.config.ts";

/**
 * 文字列を安全なファイル名に変換する関数
 * @param {string} name - 元の文字列
 * @returns {string} 安全なファイル名 (lowercase, space->hyphen, a-z0-9- only)
 */
function generateSafeFilename(name) {
  if (!name) return "";
  return name
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, "") // Remove non-alphanumeric characters except hyphens
    .replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens
}

/**
 * vite.config.ts を更新する関数
 * @param {string} entryPath - 新しいエントリーパス
 * @param {string} displayName - スクリプト表示名
 * @param {string} description - 新しい説明
 */
function updateViteConfig(entryPath, displayName, description) {
  try {
    let content = fs.readFileSync(VITE_CONFIG, "utf8");
    let updated = false;

    // entry を更新 (正規表現で柔軟にマッチ)
    content = content.replace(/entry:\s*['"][^'"]+['"]/, (match) => {
      updated = true;
      // Use forward slashes for paths in config files
      return `entry: '${entryPath.replace(/\\/g, "/")}'`;
    });

    // name を更新
    content = content.replace(/name:\s*['"][^'"]+['"]/, (match) => {
      updated = true;
      return `name: '${displayName}'`;
    });

    // description を更新
    content = content.replace(/description:\s*['"][^'"]+['"]/, (match) => {
      updated = true;
      return `description: '${description}'`;
    });

    if (updated) {
      fs.writeFileSync(VITE_CONFIG, content, "utf8");
      console.log(`🔧 Updated ${VITE_CONFIG} (entry, name, description).`);
      console.log(
        `   ❗ Please review ${VITE_CONFIG} and adjust match/grant rules.`
      );
    } else {
      console.warn(
        `⚠️ Could not find entry, name, or description fields in ${VITE_CONFIG} to update.`
      );
    }
  } catch (err) {
    console.error(`❌ Error updating ${VITE_CONFIG}:`, err.message);
    throw err; // Propagate error to stop the process
  }
}

async function main() {
  console.log("\n--- New Script Initialization ---");

  readline.question(
    `Enter the new script display name (e.g., my-awesome-script): `,
    (displayName) => {
      if (!displayName) {
        console.error("\n❌ Error: Script name cannot be empty.");
        readline.close();
        process.exit(1);
      }

      const safeFilename = generateSafeFilename(displayName);
      if (!safeFilename) {
        console.error(
          `\n❌ Error: Could not generate a valid safe filename from '${displayName}'. Please use alphanumeric characters and hyphens.`
        );
        readline.close();
        process.exit(1);
      }

      const finalScriptPath = path.join(SRC_DIR, `${safeFilename}.ts`);

      console.log(`    Display Name: '${displayName}'`);
      console.log(`    Safe Filename: '${safeFilename}.ts'`);
      console.log(`    Target Path:   '${finalScriptPath}'`);

      // --- File Checks ---
      if (fs.existsSync(finalScriptPath)) {
        console.error(
          `\n❌ Error: Script file '${finalScriptPath}' already exists.`
        );
        readline.close();
        process.exit(1);
      }
      if (!fs.existsSync(TEMPLATE_FILE)) {
        console.error(
          `\n❌ Error: Template file '${TEMPLATE_FILE}' not found.`
        );
        readline.close();
        process.exit(1);
      }
      if (!fs.existsSync(VITE_CONFIG)) {
        console.error(`\n❌ Error: Config file '${VITE_CONFIG}' not found.`);
        readline.close();
        process.exit(1);
      }

      try {
        // --- File Operations ---
        console.log(
          `\n🔧 Creating directory ${SRC_DIR} if it doesn't exist...`
        );
        fs.mkdirSync(SRC_DIR, { recursive: true });

        console.log(`🔧 Copying ${TEMPLATE_FILE} to ${finalScriptPath}...`);
        fs.copyFileSync(TEMPLATE_FILE, finalScriptPath);

        // --- Update Config ---
        const newDescription = `Enter description for ${displayName}`; // Default description
        updateViteConfig(finalScriptPath, displayName, newDescription);

        console.log(`✅ New script '${displayName}' initialized.`);
        console.log(`   Entry file: ${finalScriptPath}`);

        // --- Open in VS Code ---
        // Check if 'code' command exists
        exec("command -v code", (error) => {
          if (!error) {
            console.log(
              `\nAttempting to open '${finalScriptPath}' in the current VS Code window...`
            );
            // Execute 'code -r' command. Escape path for safety.
            exec(`code -r "${finalScriptPath}"`, (execError) => {
              if (execError) {
                console.warn(
                  `   ⚠️ Could not open file in VS Code: ${execError.message}`
                );
              }
            });
          }
          readline.close();
          console.log("--------------------------------");
        });
      } catch (err) {
        console.error(
          "\n❌ An error occurred during initialization:",
          err.message
        );
        // Attempt cleanup if file was created before config update failed
        if (fs.existsSync(finalScriptPath)) {
          try {
            fs.unlinkSync(finalScriptPath);
            console.log(`   🧹 Cleaned up created file: ${finalScriptPath}`);
          } catch (cleanupErr) {
            console.error(
              `   ⚠️ Failed to clean up file ${finalScriptPath}:`,
              cleanupErr.message
            );
          }
        }
        readline.close();
        process.exit(1);
      }
    }
  );
}

main();
