#!/usr/bin/env node

import { join, resolve } from 'path';
import { fileURLToPath } from "url";
import { spawnSync } from 'child_process';
import { existsSync } from 'fs';

// NOTE: Assuming readBinaryName() is defined elsewhere and works correctly
// and that this script resides in a structure like:
// PROJECT_ROOT/
// ├── run/
// │   └── script.js (this file)
// └── go/
//     └── package.go (the source file)

// -------------------------------------------------------------
// CORRECTION: Use Go executable and source path
// -------------------------------------------------------------

// Path to the Go source file (relative to the script's location)
const ROOT_DIR = resolve(fileURLToPath(import.meta.url), "..", "..");
const sourcePath = join(ROOT_DIR, "go", "package.go");

// Check if the Go source file exists
if (!existsSync(sourcePath)) {
    console.error(`Fatal Error: Go source file not found at: ${sourcePath}`);
    process.exit(1);
}

// Get command-line arguments (exclude node and script name)
const args = process.argv.slice(2);

// The command to execute the Go script is 'go run <sourcePath> [args]'
const command = 'go';
const commandArgs = ['run', sourcePath, ...args]; // This correctly constructs the command array

// Execute the Go program using 'go run'
// Note: 'go' must be available in the system's PATH.
const child = spawnSync(command, commandArgs, { stdio: 'inherit' });

// Handle child process results
if (child.error) {
    // This typically catches errors like 'go' command not found
    console.error(`Failed to execute Go program: ${child.error.message}`);
    // Check if the error is due to 'go' not being installed/in PATH
    if (child.error.code === 'ENOENT') {
        console.error("HINT: Ensure the 'go' command is installed and available in your system's PATH.");
    }
    process.exit(1);
}

// Exit with the child's exit code (the exit code of the 'go run' process)
process.exit(child.status);