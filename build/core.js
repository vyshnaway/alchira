import fs from "fs";
import path from "path";
import fg from "fast-glob";
import ignore from "ignore";

// --- Configuration ---
const coreDir = path.resolve("../core");

// Helper to recursively delete dir (modern Node.js)
function rmrfExceptGit(dir) {
  fs.readdirSync(dir).forEach(item => {
    if (item === '.git') return; // Skip .git
    const fullPath = path.join(dir, item);
    if (fs.lstatSync(fullPath).isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(fullPath);
    }
  });
}

// Helper to copy file, preserving relative directory
function copyFilePreserveDir(src, destRoot) {
  const dest = path.join(destRoot, src);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

// Main workflow
(async () => {

  // --- Core Publishing Logic ---
  try {
    let ig = ignore();
    for (const ignoreFile of [".npmignore"]) {
      const filePath = path.join(process.cwd(), ignoreFile);
      if (fs.existsSync(filePath)) {
        ig.add(fs.readFileSync(filePath, "utf8"));
      }
    }

    // 3. List all files/folders recursively
    // Note: 'fg' is async and must be awaited here.
    const allFiles = await fg(["**/*", "!node_modules/**/*", "!.git/**/*"], {
      dot: true,
      onlyFiles: true,
      followSymbolicLinks: true,
      ignore: ["core/**/*"], // Explicitly ignore the target directory
    });
    
    // 4. Filter with ignore rules
    const filtered = ig.filter(allFiles);

    // 5. Prepare and Copy Files
    rmrfExceptGit(coreDir);
    filtered.forEach(file => copyFilePreserveDir(file, coreDir));
    console.log(`Copied ${filtered.length} files to ${coreDir}`);
  } catch (error) {
    console.error("\n*** FAILED TO PUBLISH CHANGES ***");
    console.error("Error Message:", error.message.trim());
    console.error("Check local changes, and core repository remote setup.");
    process.exit(1);
  }
})();