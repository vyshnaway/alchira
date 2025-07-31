#!/usr/bin/env node

import path from "path";
import { fileURLToPath } from "url";
import { execFileSync } from 'child_process';

const os = process.platform;
const arch = process.arch;
const root = path.resolve(fileURLToPath(import.meta.url), "../..");

let archSuffix = '';
let fileExtension = '';
let binPath = path.join(root, 'binaries/');

switch (os) {

    case 'win32':
        fileExtension = '.exe'; if (arch === 'x64') {
            archSuffix = 'amd64';
        } else if (arch === 'arm64') {
            archSuffix = 'arm64';
        } else if (arch === 'ia32') {
            archSuffix = '386';
        } else {
            console.error(`Unsupported Windows Architecture: ${arch}`);
            process.exit(1);
        }
        binPath += `win-${archSuffix}${fileExtension}`;
        break;

    case 'linux':
        fileExtension = ''; if (arch === 'x64') {
            archSuffix = 'amd64';
        } else if (arch === 'arm64') {
            archSuffix = 'arm64';
        } else if (arch === 'arm') {
            archSuffix = 'armv7';
        } else {
            console.error(`Unsupported Linux Architecture: ${arch}`);
            process.exit(1);
        }
        binPath += `linux-${archSuffix}${fileExtension}`;
        break;

    case 'darwin':
        fileExtension = ''; if (arch === 'x64') {
            archSuffix = 'amd64';
        } else if (arch === 'arm64') {
            archSuffix = 'arm64';
        } else {
            console.error(`Unsupported macOS Architecture: ${arch}`);
            process.exit(1);
        }
        binPath += `darwin-${archSuffix}${fileExtension}`;
        break;

    default:
        console.error(`Unsupported OS: ${os}`);
        process.exit(1);
}

try {
    // console.log(`Detected OS: ${os}`);
    // console.log(`Detected Architecture: ${arch}`);
    // console.log(`Attempting to execute binary: ${binPath}`);
    execFileSync(binPath, { stdio: 'inherit' });
    console.log('Binary executed successfully.');
} catch (error) {
    console.error(`Error executing binary: ${error.message}`); if (error.code === 'ENOENT') {
        console.error(`Please ensure the binary '${binPath}' exists and has execute permissions.`);
    } else if (error.code === 'EACCES') {
        console.error(`Permission denied for '${binPath}'. Please ensure it has execute permissions (e.g., 'chmod +x ${binPath}').`);
    }
    process.exit(1);
}