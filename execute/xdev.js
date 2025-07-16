#!/usr/bin/env node
import { execFileSync } from 'child_process';

let binPath = '';
let archSuffix = '';
let fileExtension = '';

const os = process.platform;
const arch = process.arch;

switch (os) {
    case 'win32':
        fileExtension = '.exe';
        if (arch === 'x64') {
            archSuffix = 'amd64';
        } else if (arch === 'ia32') {
            archSuffix = '386';
        } else {
            console.error(`Unsupported Windows Architecture: ${arch}`);
            process.exit(1);
        }
        binPath = `execute/bin/windows-${archSuffix}${fileExtension}`;
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
        binPath = `execute/bin/linux-${archSuffix}${fileExtension}`;
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
        binPath = `execute/bin/darwin-${archSuffix}${fileExtension}`;
        break;
    default:
        console.error(`Unsupported OS: ${os}`);
        process.exit(1);
}

try {
    // console.log({os, arch, binPath});
    execFileSync('node', ['../javascript/main.js'], { stdio: 'inherit' });
} catch (error) {
    console.error(`Error executing binary: ${error.message}`);
    if (error.code === 'ENOENT') {
        console.error(`Please ensure the binary '${binPath}' exists and has execute permissions.`);
    } else if (error.code === 'EACCES') {
        console.error(`Permission denied for '${binPath}'. Please ensure it has execute permissions (e.g., 'chmod +x ${binPath}').`);
    }
    process.exit(1);
}