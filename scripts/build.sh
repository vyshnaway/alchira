#!/bin/sh

TIME_STAMP=$(date +%s)

OUT_DIR=./binary
TMP_EXE="$OUT_DIR/executable"
go build -gcflags='all=-l -N' -ldflags='-s -w' -o "$TMP_EXE"
$TMP_EXE

echo "Cleaning up existing binaries..."
rm -rf ./$OUT_DIR/*

echo "Building for Linux (AMD64)..."
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -buildvcs=false -trimpath -ldflags="-s -w -extldflags '-static'" -o ./$OUT_DIR/linux-amd64

echo "Building for Linux (ARM64)..."
CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -buildvcs=false -trimpath -ldflags="-s -w -extldflags '-static'" -o ./$OUT_DIR/linux-arm64

echo "Building for Linux (ARMv7)..."
CGO_ENABLED=0 GOOS=linux GOARCH=arm go build -buildvcs=false -trimpath -ldflags="-s -w -extldflags '-static'" -o ./$OUT_DIR/linux-armv7

echo "Building for Windows (AMD64)..."
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -buildvcs=false -trimpath -ldflags="-s -w -extldflags '-static'" -o ./$OUT_DIR/windows-amd64.exe

echo "Building for Windows (ARM64)..."
CGO_ENABLED=0 GOOS=windows GOARCH=arm64 go build -buildvcs=false -trimpath -ldflags="-s -w -extldflags '-static'" -o ./$OUT_DIR/windows-arm64.exe

echo "Building for Windows (386)..."
CGO_ENABLED=0 GOOS=windows GOARCH=386 go build -buildvcs=false -trimpath -ldflags="-s -w -extldflags '-static'" -o ./$OUT_DIR/windows-386.exe

echo "Building for macOS (AMD64)..."
CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build -buildvcs=false -trimpath -ldflags="-s -w -extldflags '-static'" -o ./$OUT_DIR/darwin-amd64

echo "Building for macOS (ARM64 - Apple Silicon)..."
CGO_ENABLED=0 GOOS=darwin GOARCH=arm64 go build -buildvcs=false -trimpath -ldflags="-s -w -extldflags '-static'" -o ./$OUT_DIR/darwin-arm64

echo