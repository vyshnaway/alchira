#!/bin/bash

# This script builds a Go project for multiple operating systems and architectures.
# It assumes your Go source code is in a directory named 'gosource'
# and will output the compiled binaries into a directory named 'execute/bin'.

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Cleaning up existing binaries..."
# Remove all files in the ./execute/bin directory
rm -rf ./execute/bin/*

echo "Changing to gosource directory..."
# Change to the Go source directory
cd gosource

echo "Building for Linux (AMD64)..."
# Build for Linux AMD64, stripping debug information
GOOS=linux GOARCH=amd64 go build -ldflags='-s -w' -o ../execute/bin/linux-amd64

echo "Building for Linux (ARM64)..."
# Build for Linux ARM64, stripping debug information
GOOS=linux GOARCH=arm64 go build -ldflags='-s -w' -o ../execute/bin/linux-arm64

echo "Building for Linux (ARMv7)..."
# Build for Linux ARMv7, stripping debug information
GOOS=linux GOARCH=arm go build -ldflags='-s -w' -o ../execute/bin/linux-armv7

echo "Building for Windows (AMD64)..."
# Build for Windows AMD64, stripping debug information
GOOS=windows GOARCH=amd64 go build -ldflags='-s -w' -o ../execute/bin/win-amd64.exe

# echo "Building for Windows (ARM64)..."
# # Build for Windows AMD64, stripping debug information
# GOOS=windows GOARCH=arm64 go build -ldflags='-s -w' -o ../execute/bin/win-arm64.exe

echo "Building for Windows (386)..."
# Build for Windows 386, stripping debug information
GOOS=windows GOARCH=386 go build -ldflags='-s -w' -o ../execute/bin/win-386.exe

echo "Building for macOS (AMD64)..."
# Build for macOS AMD64, stripping debug information
GOOS=darwin GOARCH=amd64 go build -ldflags='-s -w' -o ../execute/bin/darwin-amd64

echo "Building for macOS (ARM64 - Apple Silicon)..."
# Build for macOS ARM64, stripping debug information
GOOS=darwin GOARCH=arm64 go build -ldflags='-s -w' -o ../execute/bin/darwin-arm64

cd ../execute/bash
# Making binaries executable
echo "Assigning executables..."
chmod +x ./chmod.sh
./chmod.sh

echo "Returning to parent directory..."
# Return to the parent directory
cd ../..

echo "All builds complete!"
echo "..."
