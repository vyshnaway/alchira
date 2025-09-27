#!/bin/bash

# Script for one-time detection of compatible binaries (no semantic names)
# Assumes binaries are in 'bin/' folder with arbitrary names
# Performs a "hard test": attempts to execute each with a safe flag (e.g., --version)
# Applies chmod +x to all compatible binaries if needed
# Saves the first compatible binary's filename to 'bin/.run.txt'
# Saves log to 'log/detect_binary_YYYYMMDD_HHMMSS.log'
# Ignores files starting with '.' in bin/

# Directory containing binaries (adjust if needed)
BIN_DIR="./bin"

# Log directory and files
LOG_DIR="./log"
ENV_FILE="$BIN_DIR/.select."
LOG_FILE="$LOG_DIR/detect_binary_$(date +%Y%m%d_%H%M%S).log"

# Test command flag (assume binaries support --version or replace with a no-op test)
TEST_FLAG="--version"

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Error: Could not create log directory '$LOG_DIR'" >&2
    exit 1
fi

# Initialize log file
echo "Binary detection log" > "$LOG_FILE"
echo "Generated on $(date)" >> "$LOG_FILE"
echo "----------------------------------------" >> "$LOG_FILE"

# Check if bin directory exists
if [ ! -d "$BIN_DIR" ]; then
    echo "Error: Binary directory '$BIN_DIR' not found" >> "$LOG_FILE"
    echo "Error: Binary directory not found" >&2
    exit 1
fi

# Initialize variables
found_binary=""
detected_count=0

# Find all files in bin/, excluding those starting with '.'
while IFS= read -r binary; do
    if [ -f "$binary" ]; then
        binary_name=$(basename "$binary")
        echo "Testing binary: $binary_name" >> "$LOG_FILE"

        # Check if binary is executable; if not, try to make it executable
        if [ ! -x "$binary" ]; then
            echo "Applying chmod +x to $binary_name" >> "$LOG_FILE"
            chmod +x "$binary" 2>> "$LOG_FILE"
            if [ $? -ne 0 ]; then
                echo "Warning: Failed to apply chmod +x to $binary_name" >> "$LOG_FILE"
                echo "----------------------------------------" >> "$LOG_FILE"
                continue
            fi
        fi

        # Perform hard test: try to run with test flag, capture output/errors
        output=$("$binary" $TEST_FLAG 2>&1)
        exit_code=$?

        echo "Exit code: $exit_code" >> "$LOG_FILE"
        echo "Output: $output" >> "$LOG_FILE"

        # Check if execution was successful (exit code 0 and no exec format error)
        if [ $exit_code -eq 0 ] && [[ ! "$output" =~ "exec format error" ]] && [[ ! "$output" =~ "cannot execute binary file" ]]; then
            echo "Success: Compatible binary found - $binary_name" >> "$LOG_FILE"
            detected_count=$((detected_count + 1))
            # Save the first compatible binary
            if [ -z "$found_binary" ]; then
                found_binary="$binary_name"
            fi
        else
            echo "Failure: Incompatible binary - $binary_name" >> "$LOG_FILE"
            # Revert chmod -x if applied and binary is incompatible
            if [ ! -x "$binary" ]; then
                chmod -x "$binary" 2>> "$LOG_FILE"
                echo "Reverted chmod -x for incompatible binary $binary_name" >> "$LOG_FILE"
            fi
        fi
        echo "----------------------------------------" >> "$LOG_FILE"
    fi
done < <(find "$BIN_DIR" -type f -not -name ".*" 2>/dev/null)

# Validate results
if [ $detected_count -gt 0 ] && [ -n "$found_binary" ]; then
    # Save to .run.txt in bin directory
    echo "$found_binary" > "$ENV_FILE"
    echo "Detection complete. Saved to $ENV_FILE: BINARY_FILENAME=$found_binary" >> "$LOG_FILE"
    echo "Detection complete. Selected first compatible binary: $found_binary" >&2
    if [ $detected_count -gt 1 ]; then
        echo "Note: $detected_count compatible binaries found, using the first one ($found_binary)" >> "$LOG_FILE"
    fi
    exit 0
else
    echo "Error: No compatible binary found." >> "$LOG_FILE"
    echo "Error: No compatible binary detected." >&2
    exit 1
fi