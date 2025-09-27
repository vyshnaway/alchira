// esmodules-executor.mjs

// Import the 'child_process' module using ES Modules import syntax
import { execFileSync } from 'child_process';
// Node.js global process variables are directly available in ES Modules
import process from 'process'; // Explicit import for clarity, though often implicitly available

const os = process.platform;
const arch = process.arch; // Node.js architecture (e.g., 'x64', 'arm64', 'arm', 'ia32')

console.log(`Detected OS: ${os}`);
console.log(`Detected Architecture: ${arch}`);

let binPath;
let archSuffix = '';
let fileExtension = '';

// Determine the correct binary path based on the detected operating system and architecture
switch (os) {
    case 'win32':
        fileExtension = '.exe';
        // Map Node.js 'x64' to Go's 'amd64', and Node.js 'ia32' (or 'x32') to Go's '386'
        if (arch === 'x64') {
            archSuffix = 'amd64';
        } else if (arch === 'ia32') { // Node.js uses 'ia32' for 32-bit Intel
            archSuffix = '386';
        } else {
            console.error(`Unsupported Windows Architecture: ${arch}`);
            process.exit(1);
        }
        binPath = `binaries/windows-${archSuffix}${fileExtension}`;
        break;

    case 'linux':
        fileExtension = ''; // Linux executables typically have no extension
        // Map Node.js architectures to Go's build targets
        if (arch === 'x64') {
            archSuffix = 'amd64';
        } else if (arch === 'arm64') {
            archSuffix = 'arm64';
        } else if (arch === 'arm') {
            // Node.js 'arm' typically maps to Go's 'arm' (which often defaults to armv7)
            // Your build script explicitly names it 'linux-armv7'
            archSuffix = 'armv7';
        } else {
            console.error(`Unsupported Linux Architecture: ${arch}`);
            process.exit(1);
        }
        binPath = `binaries/linux-${archSuffix}${fileExtension}`;
        break;

    case 'darwin':
        fileExtension = ''; // macOS executables typically have no extension
        // Map Node.js 'x64' to Go's 'amd64' (Intel), and Node.js 'arm64' to Go's 'arm64' (Apple Silicon)
        if (arch === 'x64') {
            archSuffix = 'amd64';
        } else if (arch === 'arm64') {
            archSuffix = 'arm64';
        } else {
            console.error(`Unsupported macOS Architecture: ${arch}`);
            process.exit(1);
        }
        binPath = `binaries/darwin-${archSuffix}${fileExtension}`;
        break;

    default:
        console.error(`Unsupported OS: ${os}`);
        process.exit(1);
}

try {
    console.log(`Attempting to execute binary: ${binPath}`);
    // Execute the binary synchronously, inheriting stdio (input/output) from the parent process
    execFileSync(binPath, { stdio: 'inherit' });
    console.log('Binary executed successfully.');
} catch (error) {
    // Catch and log any errors during execution
    console.error(`Error executing binary: ${error.message}`);
    // If the error is due to file not found or permissions, provide a more specific hint
    if (error.code === 'ENOENT') {
        console.error(`Please ensure the binary '${binPath}' exists and has execute permissions.`);
    } else if (error.code === 'EACCES') {
        console.error(`Permission denied for '${binPath}'. Please ensure it has execute permissions (e.g., 'chmod +x ${binPath}').`);
    }
    process.exit(1);
}
