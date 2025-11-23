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
SCRIPT_PATH="$(resolve_real_path "$0")"
SCRIPT_DIR="$(dirname "$SCRIPT_PATH")"

# Full absolute paths for source and output
SRC_PATH="$(cd "$SCRIPT_DIR/../" && pwd -P)"
OUT_DIR="$SRC_PATH/bin"
BIN_PATH="$OUT_DIR/executable"

# --- 2. Build Execution ---

# Create the output directory if it doesn't exist
mkdir -p "$OUT_DIR"

# echo "Building project..."

# Change directory to the Go source location temporarily.
# This ensures that 'go build' correctly uses relative paths for packages 
# defined within the module (like go/cache, go/fileman, etc.)
cd "$SRC_PATH"

# Execute the build command
# -ldflags='-s -w' strips debugging info for smaller size.
# The executable is placed at the absolute path $BIN_PATH
go build -gcflags='all=-l -N' -ldflags='-s -w' -o "$BIN_PATH" 

# Return to the original execution directory
cd $PROJECT_DIR

# Continue command with latest binary
# echo "Executing binary..."
# echo
"$BIN_PATH" "$@"