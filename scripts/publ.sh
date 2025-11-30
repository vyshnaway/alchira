#!/bin/bash

# Save the original working directory
WORKDIR=$(pwd)

# Get version from the first argument
VERSION="$1"

# If version not provided, read it from package.json
if [ -z "$VERSION" ]; then
  if command -v jq >/dev/null 2>&1; then
    VERSION=$(jq -r '.version' package.json)
  else
    # Fallback using grep and sed (less robust)
    VERSION=$(grep '"version"' package.json | sed -E 's/.*"version": *"([^"]+)".*/\1/')
  fi

  # If still empty, exit with error
  if [ -z "$VERSION" ]; then
    echo "Version not specified and unable to read from package.json"
    exit 1
  fi

  echo "No version argument provided, using version from package.json: $VERSION"
fi

# Update version in package.json using jq
if command -v jq >/dev/null 2>&1; then
  jq --arg v "$VERSION" '.version = $v' package.json > package.tmp.json && mv package.tmp.json package.json
  echo "Updated package.json version to $VERSION"
else
  # Fallback: use sed (less safe, assumes simple JSON)
  sed -i.bak -E "s/\"version\": \"[^\"]+\"/\"version\": \"$VERSION\"/" package.json
  echo "Updated package.json version to $VERSION (using sed fallback)"
fi

node ./execute void

# Prepare commit message
COMMIT_MSG="#Release v$VERSION"

# List of relative paths to repositories to commit and push
REPOS=(
  "."            # root repository
  "./scaffold"   # example submodule path; add more if needed
  "./compiler"
)

# # Loop through each path, commit, and push
for repo in "${REPOS[@]}"; do
  echo "==============================="
  echo "Processing repository at: $repo"

  # Change to repository path
  cd "$WORKDIR/$repo" || { echo "Failed to cd into $repo"; exit 1; }

  # Fetch latest changes and rebase to avoid conflicts
  git fetch origin main

  # Check if there are any changes to commit
  if [[ $(git status --porcelain) ]]; then
    git add .
    git commit -m "$COMMIT_MSG"
    git push origin main || { echo "Failed to push $repo"; exit 1; }
    echo "Successfully pushed changes in $repo"
  else
    echo "No changes to commit in $repo"
  fi
done

# Return to original working directory
cd "$WORKDIR"
