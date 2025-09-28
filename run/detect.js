#!/usr/bin/env node

import { readdirSync, statSync, readFileSync, writeFileSync, chmodSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from "url";
import { spawnSync } from 'child_process';

// ---------------------------------------------------------------------
// 1. CONFIGURATION (Relative paths are critical: '.' is the 'run' folder)
// ---------------------------------------------------------------------

// Since the script runs from './run/', paths are relative to the parent directory (project root).
const BIN_DIR = resolve(fileURLToPath(import.meta.url), "..", "..", 'exec');
const ENV_FILENAME = '_run_';
const LOG_FILENAME = '_log_';

const ENV_FILE = join(BIN_DIR, ENV_FILENAME);
const LOG_FILE = join(BIN_DIR, LOG_FILENAME);
const TEST_ARG = 'test';

// ---------------------------------------------------------------------
// 2. BINARY DETECTION FUNCTION (Modified to use absolute paths)
// ---------------------------------------------------------------------

/**
 * Searches the BIN_DIR, tests each file for compatibility, and saves the first one found
 * to the .select. file.
 * @returns {string | null} The filename of the compatible binary, or null if detection failed.
 */
export function detectCompatibleBinary() {
    let foundBinary = null;
    let detectedCount = 0;

    // 1. Setup Log Directory
    try {
        writeFileSync(LOG_FILE, `Binary detection log\nGenerated on ${new Date()}\n----------------------------------------\n`);
    } catch (e) {
        console.error(`Error: Could not create log directory or file: ${e.message}`);
        return null;
    }

    // 2. Read Binaries
    let binFiles;
    try {
        binFiles = readdirSync(BIN_DIR);
    } catch (e) {
        const msg = `Error: Binary directory '${BIN_DIR}' not found.`;
        writeFileSync(LOG_FILE, msg + '\n', { flag: 'a' });
        console.error(msg);
        return null;
    }

    // 3. Test Each Binary
    for (const binaryName of binFiles) {
        if ((binaryName === ENV_FILENAME) || (binaryName == LOG_FILENAME)) continue;

        const binaryPath = join(BIN_DIR, binaryName);
        let fileStat;

        try {
            fileStat = statSync(binaryPath);
        } catch (e) {
            continue;
        }

        if (fileStat.isFile()) {
            writeFileSync(LOG_FILE, `Testing binary: ${binaryName}\n`, { flag: 'a' });

            // Ensure executable permission (critical for Unix-like systems)
            try {
                chmodSync(binaryPath, '755');
                writeFileSync(LOG_FILE, `Applied chmod +x to ${binaryName}\n`, { flag: 'a' });
            } catch (e) {
                writeFileSync(LOG_FILE, `Warning: Failed to apply chmod +x to ${binaryName}: ${e.message}\n----------------------------------------\n`, { flag: 'a' });
                continue;
            }

            // Perform hard test: execute the binary
            const child = spawnSync(binaryPath, [TEST_ARG], { encoding: 'utf8' });
            const exitCode = child.status;
            const output = child.stdout + child.stderr;

            writeFileSync(LOG_FILE, `Exit code: ${exitCode}\nOutput: ${output}\n`, { flag: 'a' });

            // Check for success: exit code 0 AND no common incompatibility errors
            const isCompatible = (exitCode === 0 &&
                !output.includes('exec format error') &&
                !output.includes('cannot execute binary file')) || child.stdout.length;

            if (isCompatible) {
                writeFileSync(LOG_FILE, `Success: Compatible binary found - ${binaryName}\n----------------------------------------\n`, { flag: 'a' });
                detectedCount++;
                if (foundBinary === null) {
                    foundBinary = binaryName;
                }
            } else {
                writeFileSync(LOG_FILE, `Failure: Incompatible binary - ${binaryName}\n----------------------------------------\n`, { flag: 'a' });
            }
        }
    }

    // 4. Finalize and Save
    if (foundBinary) {
        // Save the *filename* only
        writeFileSync(ENV_FILE, foundBinary.trim());
        const finalMsg = `Selected first compatible binary: ${foundBinary}`;
        writeFileSync(LOG_FILE, `\n${finalMsg}\n`, { flag: 'a' });
        console.error(finalMsg);
        return foundBinary;
    } else {
        const errorMsg = 'Error: No compatible binary detected.';
        writeFileSync(LOG_FILE, `\n${errorMsg}\n`, { flag: 'a' });
        console.error(errorMsg);
        return null;
    }
}


// ---------------------------------------------------------------------
// 3. LAUNCHER CORE LOGIC (INTEGRATED)
// ---------------------------------------------------------------------

/**
 * Reads the selected binary name, triggering detection if the file is missing.
 * @returns {string | null} The name of the binary to execute.
 */
export function getBinaryPath() {
    try {
        // 1. Try reading the environment file
        const selectedName = readFileSync(ENV_FILE, 'utf8').trim();
        const binaryPath = join(BIN_DIR, selectedName);
        return binaryPath;
    } catch (err) {
        if (err.code === 'ENOENT') {
            // 2. File not found, run the detection logic
            console.error(`Selection not found at ${ENV_FILE}.`);
            console.error(`Running detection...`);
            const selectedName = detectCompatibleBinary();

            if (selectedName) {
                const binaryPath = join(BIN_DIR, selectedName);
                return binaryPath;
            } else {
                console.error("Fatal Error: Detection failed to find a compatible binary.");
                process.exit(1);
            }
        } else {
            // 3. Other read error
            console.error(`Error reading ${ENV_FILE}: ${err.message}`);
            process.exit(1);
        }
    }
}