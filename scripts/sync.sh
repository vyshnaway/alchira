#!/bin/bash

# Save the original working directory
WORKDIR=$(pwd)

VERSION=""
COMMIT_MSG=""

# Parse arguments
if [[ "$1" == "-p" ]]; then
  VERSION="$2"
  if [ -z "$VERSION" ]; then
    # No version flag value, fallback to version from package.json
    if command -v jq >/dev/null 2>&1; then
      VERSION=$(jq -r '.version' package.json)
    else
      VERSION=$(grep '"version"' package.json | sed -E 's/.*"version": *"([^"]+)".*/\1/')
    fi
    if [ -z "$VERSION" ]; then
      echo "Version not specified and unable to read from package.json"
      exit 1
    fi
  fi
  COMMIT_MSG="#Release v$VERSION"
elif [[ "$1" == "m" ]]; then
  shift
  # Use rest of the arguments as custom commit message
  COMMIT_MSG="$*"
else
  COMMIT_MSG="Periodic Commit"
fi


# If version is set (only if -p or fallback), update package.json version
if [ -n "$VERSION" ]; then
  if command -v jq >/dev/null 2>&1; then
    jq --arg v "$VERSION" '.version = $v' package.json > package.tmp.json && mv package.tmp.json package.json
    echo "Updated package.json version to $VERSION"
  else
    sed -i.bak -E "s/\"version\": \"[^\"]+\"/\"version\": \"$VERSION\"/" package.json
    echo "Updated package.json version to $VERSION (using sed fallback)"
  fi
fi

node ./execute void

# List of relative paths to repositories to commit and push
REPOS=(
  "./scaffold"
  "./compiler"
  "."
)

echo "VERSION: $VERSION"
echo "MESSAGE: $COMMIT_MSG"
echo "==============================="
# # Loop through each path, commit, and push
for repo in "${REPOS[@]}"; do
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
  echo "==============================="
done

# Return to original working directory
cd "$WORKDIR"
