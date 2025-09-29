#!/bin/sh

TIME_STAMP=$(date +%s)

# Update Executables

echo "Cleaning up existing binaries..."
EXEC_DIR="./exec"
rm -rf $EXEC_DIR/*

echo "Changing to gosource directory..."
cd go

echo "Building for Linux (AMD64)..."
GOOS=linux GOARCH=amd64 go build -buildvcs=false -ldflags='-s -w' -o ../$EXEC_DIR/$TIME_STAMP\_linux-amd64

echo "Building for Linux (ARM64)..."
GOOS=linux GOARCH=arm64 go build -buildvcs=false -ldflags='-s -w' -o ../$EXEC_DIR/$TIME_STAMP\_linux-arm64

echo "Building for Linux (ARMv7)..."
GOOS=linux GOARCH=arm go build -buildvcs=false -ldflags='-s -w' -o ../$EXEC_DIR/$TIME_STAMP\_linux-armv7

echo "Building for Windows (AMD64)..."
GOOS=windows GOARCH=amd64 go build -buildvcs=false -ldflags='-s -w' -o ../$EXEC_DIR/$TIME_STAMP\_win-amd64.exe

echo "Building for Windows (ARM64)..."
GOOS=windows GOARCH=arm64 go build -buildvcs=false -ldflags='-s -w' -o ../$EXEC_DIR/$TIME_STAMP\_win-arm64.exe

echo "Building for Windows (386)..."
GOOS=windows GOARCH=386 go build -buildvcs=false -ldflags='-s -w' -o ../$EXEC_DIR/$TIME_STAMP\_win-386.exe

echo "Building for macOS (AMD64)..."
GOOS=darwin GOARCH=amd64 go build -buildvcs=false -ldflags='-s -w' -o ../$EXEC_DIR/$TIME_STAMP\_darwin-amd64

echo "Building for macOS (ARM64 - Apple Silicon)..."
GOOS=darwin GOARCH=arm64 go build -buildvcs=false -ldflags='-s -w' -o ../$EXEC_DIR/$TIME_STAMP\_darwin-arm64

echo "Returning to parent directory..."
cd ..

echo "Updating core submodule..."
node ./build/core.js

# Commit Submodule

printf "Enter commit message: "
read commitMessage

if [ -z "$commitMessage" ]; then
  echo "No commit message provided. Aborting publish."
  exit 1
fi

coreDir="./core"

# Submodule Commit/Push
echo "\n--- Publishing Submodule ($coreDir) ---"
cd "$coreDir" || exit 1

git add .
git commit -m "$commitMessage"
git push
if [ $? -ne 0 ]; then
  echo "\n*** FAILED TO PUBLISH CHANGES TO SUBMODULE ***"
  echo "Check git status, local changes, and core repository remote setup."
  exit 1
fi
cd - >/dev/null # Go back to main repo

echo "Submodule pushed successfully."

# Main Repo Commit/Push
echo "\n--- Publishing Main Repository ---"
git add "$coreDir"
git commit -m "Core-updated: $commitMessage"
git push
if [ $? -ne 0 ]; then
  echo "\n*** FAILED TO PUBLISH CHANGES TO MAIN REPO ***"
  echo "Check git status, local changes, and core repository remote setup."
  exit 1
fi

echo "\nChanges have been published to GitHub."
