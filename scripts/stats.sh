#!/bin/bash

# Check if a directory is provided as an argument
if [ $# -eq 0 ]; then
    echo "Usage: $0 <directory>"
    exit 1
fi

# Store the directory path
DIR="$1"

# Check if the directory exists
if [ ! -d "$DIR" ]; then
    echo "Error: Directory '$DIR' does not exist."
    exit 1
fi

# Initialize totals
total_lines=0
total_size=0
total_files=0

# Print header
printf "%-60s %-10s %-15s %-20s\n" "File" "Lines" "Size (Bytes)" "Last Modified"
printf "%s\n" "------------------------------------------------------------"

# Find all files and collect stats
while IFS= read -r file; do
    if [ -f "$file" ] && [ -r "$file" ]; then
        # Get line count
        lines=$(wc -l < "$file" 2>/dev/null || echo "0")
        
        # Get file size (in bytes)
        # Use ls for portability across platforms
        size=$(ls -l "$file" 2>/dev/null | awk '{print $5}' || echo "0")
        
        # Get last modified timestamp (platform-agnostic with date parsing)
        modified=$(date -r "$file" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || stat -c %y "$file" 2>/dev/null | cut -d. -f1 || echo "Unknown")
        
        # Print file stats, truncate file path if too long
        printf "%-60.60s %-10d %-15d %-20s\n" "$file" "$lines" "$size" "$modified"
        
        # Update totals
        total_lines=$((total_lines + lines))
        total_size=$((total_size + size))
        total_files=$((total_files + 1))
    else
        echo "Skipping '$file': not a readable file" >&2
    fi
done < <(find "$DIR" -type f 2>/dev/null)

# Print summary
printf "%s\n" "------------------------------------------------------------"
echo "Total files: $total_files"
echo "Total lines: $total_lines"
echo "Total size: $total_size bytes"