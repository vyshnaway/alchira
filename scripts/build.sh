#!/bin/sh

TIME_STAMP=$(date +%s)

OUT_DIR=bin
SRC_DIR=source

echo "Cleaning up existing binaries..."
rm -rf ./$OUT_DIR/*

echo "Changing to gosource directory..."
cd $SRC_DIR
pwd

echo "Building for Linux (AMD64)..."
GOOS=linux GOARCH=amd64 go build -buildvcs=false -ldflags='-s -w' -o ../$OUT_DIR/linux-amd64

echo "Building for Linux (ARM64)..."
GOOS=linux GOARCH=arm64 go build -buildvcs=false -ldflags='-s -w' -o ../$OUT_DIR/linux-arm64

echo "Building for Linux (ARMv7)..."
GOOS=linux GOARCH=arm go build -buildvcs=false -ldflags='-s -w' -o ../$OUT_DIR/linux-armv7

echo "Building for Windows (AMD64)..."
GOOS=windows GOARCH=amd64 go build -buildvcs=false -ldflags='-s -w' -o ../$OUT_DIR/windows-amd64.exe

echo "Building for Windows (ARM64)..."
GOOS=windows GOARCH=arm64 go build -buildvcs=false -ldflags='-s -w' -o ../$OUT_DIR/windows-arm64.exe

echo "Building for Windows (386)..."
GOOS=windows GOARCH=386 go build -buildvcs=false -ldflags='-s -w' -o ../$OUT_DIR/windows-386.exe

echo "Building for macOS (AMD64)..."
GOOS=darwin GOARCH=amd64 go build -buildvcs=false -ldflags='-s -w' -o ../$OUT_DIR/darwin-amd64

echo "Building for macOS (ARM64 - Apple Silicon)..."
GOOS=darwin GOARCH=arm64 go build -buildvcs=false -ldflags='-s -w' -o ../$OUT_DIR/darwin-arm64

echo "Returning to source directory..."
cd ..