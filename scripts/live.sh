#!/bin/sh

# This script builds a Go project for development, ensuring it works
# regardless of the script's execution location.

# Exit immediately if a command exits with a non-zero status.
set -e

# Function to resolve the real path (dereferencing symlinks and getting physical path)
resolve_real_path() {
    local TARGET_FILE="$1"
    # Get the directory of the file and change to it
    cd "$(dirname "$TARGET_FILE")"
    TARGET_FILE="$(basename "$TARGET_FILE")"
    
    # Iterate down symlinks
    while [ -L "$TARGET_FILE" ]; do
        TARGET_FILE="$(readlink "$TARGET_FILE")"
        cd "$(dirname "$TARGET_FILE")"
        TARGET_FILE="$(basename "$TARGET_FILE")"
    done
    
    # Print the full physical path
    # pwd -P prints the physical path, resolving symlinks in the path itself
    PHYS_DIR="$(pwd -P)"
    echo "$PHYS_DIR/$TARGET_FILE"
}

# --- 1. Path Resolution ---

# echo "Resolving paths..."
PROJECT_DIR="$(pwd -P)"
# Build Executable

SCRIPT_PATH="$(resolve_real_path "$0")"
SCRIPT_DIR="$(dirname "$SCRIPT_PATH")"
SRC_PATH="$(cd "$SCRIPT_DIR/../" && pwd -P)"
BIN_PATH="$SRC_PATH/../package/binary/executable"

cd "$SRC_PATH"
go build -gcflags='all=-l -N' -ldflags='-s -w' -o "$BIN_PATH" 

# Built Executable
cd $PROJECT_DIR
"$BIN_PATH" "$@"