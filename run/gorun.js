import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';

const GO_MAIN = join("go", 'package.go');

// Get command-line arguments (exclude node and script name)
const args = process.argv.slice(2);

// Execute the binary with arguments
const child = spawnSync(binaryPath, args, { stdio: 'inherit' });

// Handle child process results
if (child.error) {
    console.error(`Failed to execute ${binaryName}: ${child.error.message}`);
    process.exit(1);
}

// Exit with the child's exit code
process.exit(child.status);