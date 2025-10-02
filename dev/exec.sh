#!/bin/sh

TIME_STAMP=$(date +%s)

EXEC_DIR=exec
GO_DIR=go

echo "Cleaning up existing binaries..."
rm -rf ./$EXEC_DIR/*

echo "Changing to gosource directory..."
cd $GO_DIR
pwd

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

echo "Returning to source directory..."
cd ..