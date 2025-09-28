#!/bin/sh
# Function to resolve the real path (dereferencing symlinks)
resolve_real_path() {
  local TARGET_FILE="$1"
  cd "$(dirname "$TARGET_FILE")"
  TARGET_FILE="$(basename "$TARGET_FILE")"
  # Iterate down symlinks
  while [ -L "$TARGET_FILE" ]; do
    TARGET_FILE="$(readlink "$TARGET_FILE")"
    cd "$(dirname "$TARGET_FILE")"
    TARGET_FILE="$(basename "$TARGET_FILE")"
  done
  # Print the full physical path
  PHYS_DIR="$(pwd -P)"
  echo "$PHYS_DIR/$TARGET_FILE"
}

SCRIPT_PATH="$(resolve_real_path "$0")"
SCRIPT_DIR="$(dirname "$SCRIPT_PATH")"
ROOT_DIR="$(cd "$SCRIPT_DIR/../" && pwd)"
TEST_SH="$ROOT_DIR/go/package.go"

# Check if package.go exists
if [ ! -f "$SOURCE_PATH" ]; then
  echo "Fatal Error: Go source file not found at: $SOURCE_PATH" >&2
  exit 1
fi

# Check if 'go' is available
if ! command -v go >/dev/null 2>&1; then
  echo "Failed to execute Go program: 'go' command not found." >&2
  echo "HINT: Ensure the 'go' command is installed and available in your system's PATH." >&2
  exit 1
fi

# Pass all command-line arguments to 'go run'
go run -ldflags='-s -w' "$SOURCE_PATH" "$@"
STATUS=$?

exit $STATUS
