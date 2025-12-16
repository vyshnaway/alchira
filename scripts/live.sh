#!/bin/sh
set -e

resolve_real_path() {
    local TARGET_FILE="$1"
    cd "$(dirname "$TARGET_FILE")" || return 1
    TARGET_FILE="$(basename "$TARGET_FILE")"
    
    while [ -L "$TARGET_FILE" ]; do
        TARGET_FILE="$(readlink "$TARGET_FILE")"
        cd "$(dirname "$TARGET_FILE")" || return 1
        TARGET_FILE="$(basename "$TARGET_FILE")"
    done
    
    # Use realpath fallback or printf %s
    printf '%s/%s\n' "$(pwd)" "$TARGET_FILE"
}

PROJECT_DIR="$(pwd)"
SCRIPT_PATH="$(resolve_real_path "$0")"
SCRIPT_DIR="$(dirname "$SCRIPT_PATH")"
SRC_PATH="$(cd "$SCRIPT_DIR/../" && pwd)"
BIN_PATH="$SRC_PATH/../package/binary/executable"

# Ensure bin dir exists
mkdir -p "$(dirname "$BIN_PATH")"

cd "$SRC_PATH" || exit 1
go build -gcflags='all=-l -N' -ldflags='-s -w' -o "$BIN_PATH"

cd "$PROJECT_DIR"
"$BIN_PATH" "$@"
