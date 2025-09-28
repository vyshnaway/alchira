#!/bin/bash

# This script builds a Go project for multiple operating systems and architectures.
# It assumes your Go source code is in a directory named 'gosource'
# and will output the compiled binaries into a directory named 'binaries'.

# Exit immediately if a command exits with a non-zero status.
set -e

# Remove all files in the ./binaries directory
EXEC_DIR="exec"

echo "Changing to gosource directory..."
# Change to the Go source directory
cd go

# Build for Linux AMD64, stripping debug information
echo "Building for Current Platform..."
go build -ldflags='-s -w' -o ../$EXEC_DIR/_test_

cd ..
echo "Build finished!"
echo "..."
