#!/usr/bin/env node

import { existsSync } from 'fs';
import { spawnSync } from 'child_process';

import { getBinaryPath } from "./detect.js";

// Get path of valid binary
const binaryPath = getBinaryPath()

// Check if binary exists (safety check)
if (!binaryPath || !existsSync(binaryPath)) {
    console.error(`Fatal Error: Selected binary file not found: ${binaryPath}`);
    process.exit(1);
}

// Get command-line arguments (exclude node and script name)
const args = process.argv.slice(2);

// Execute the binary with arguments
const child = spawnSync(binaryPath, args, { stdio: 'inherit' });

// Handle child process results
if (child.error) {
    console.error(`Failed to execute ${binaryName} at ${binaryPath}: ${child.error.message}`);
    process.exit(1);
}

// Exit with the child's exit code
process.exit(child.status);