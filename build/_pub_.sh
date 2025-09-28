#!/bin/bash

# This script builds a Go project for multiple operating systems and architectures.
# It assumes your Go source code is in a directory named 'gosource'
# and will output the compiled binaries into a directory named 'binaries'.

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Cleaning up existing binaries..."
# Remove all files in the ./binaries directory
EXEC_DIR="exec"
rm -rf ./$EXEC_DIR/*

echo "Changing to gosource directory..."
# Change to the Go source directory
cd go

echo "Building for Linux (AMD64)..."
# Build for Linux AMD64, stripping debug information
GOOS=linux GOARCH=amd64 go build -ldflags='-s -w' -o ../$EXEC_DIR/linux-amd64

echo "Building for Linux (ARM64)..."
# Build for Linux ARM64, stripping debug information
GOOS=linux GOARCH=arm64 go build -ldflags='-s -w' -o ../$EXEC_DIR/linux-arm64

echo "Building for Linux (ARMv7)..."
# Build for Linux ARMv7, stripping debug information
GOOS=linux GOARCH=arm go build -ldflags='-s -w' -o ../$EXEC_DIR/linux-armv7

echo "Building for Windows (AMD64)..."
# Build for Windows AMD64, stripping debug information
GOOS=windows GOARCH=amd64 go build -ldflags='-s -w' -o ../$EXEC_DIR/win-amd64.exe

echo "Building for Windows (ARM64)..."
# # Build for Windows AMD64, stripping debug information
GOOS=windows GOARCH=arm64 go build -ldflags='-s -w' -o ../$EXEC_DIR/win-arm64.exe

echo "Building for Windows (386)..."
# Build for Windows 386, stripping debug information
GOOS=windows GOARCH=386 go build -ldflags='-s -w' -o ../$EXEC_DIR/win-386.exe

echo "Building for macOS (AMD64)..."
# Build for macOS AMD64, stripping debug information
GOOS=darwin GOARCH=amd64 go build -ldflags='-s -w' -o ../$EXEC_DIR/darwin-amd64

echo "Building for macOS (ARM64 - Apple Silicon)..."
# Build for macOS ARM64, stripping debug information
GOOS=darwin GOARCH=arm64 go build -ldflags='-s -w' -o ../$EXEC_DIR/darwin-arm64

echo "Returning to parent directory..."
# Return to the parent directory
cd ..
echo "Build finished!"
echo "..."
