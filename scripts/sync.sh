#!/usr/bin/env bash
set -euo pipefail

WORKDIR=$(pwd)

VERSION=""
COMMIT_MSG=""

case "${1-}" in
  V)
    VERSION="${2-}"
    ;;
  M)
    shift
    COMMIT_MSG="${*:-}"
    ;;
esac

# If VERSION not passed, read from package.json
if [[ "${1-}" == "V" && -z "$VERSION" ]]; then
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

if [ -n "$VERSION" ]; then
  COMMIT_MSG="${COMMIT_MSG:-#Release v$VERSION}"
else
  COMMIT_MSG="${COMMIT_MSG:-Periodic Commit}"
fi

if command -v jq >/dev/null 2>&1; then
  jq --arg v "$VERSION" '
    if $v != "" then .version = $v else . end
    | .flavour = {
        name: "",
        version: "",
        sandbox: "",
        blueprint: "",
        libraries: ""
      }
  ' package.json > package.tmp.json && mv package.tmp.json package.json
  [ -n "$VERSION" ] && echo "Updated package.json version to $VERSION"
  echo "Cleared flavour in package.json"
else
  if [ -n "$VERSION" ]; then
    sed -i.bak -E 's/"version": *"[^"]+"/"version": "'"$VERSION"'"/' package.json
    echo "Updated package.json version to $VERSION (using sed fallback)"
  fi
  sed -i.bak -E \
    's/"flavour": *\{[^}]*\}/"flavour": {"name": "", "version": "", "sandbox": "", "blueprint": "", "libraries": ""}/' \
    package.json
  echo "Cleared flavour block in package.json (using sed fallback)"
fi

# node ./execute void sync
# xdev void sync
./compiler/scripts/live.sh void sync

# List of relative paths to repositories to commit and push
REPOS=(
  "./scaffold"
  "./compiler"
  "."
)

echo "VERSION: ${VERSION:-<none>}"
echo "MESSAGE: $COMMIT_MSG"
echo "==============================="

for repo in "${REPOS[@]}"; do
  echo "Processing repository at: $repo"

  cd "$WORKDIR/$repo" || { echo "Failed to cd into $repo"; exit 1; }

  # Ensure we are on main
  git rev-parse --verify main >/dev/null 2>&1 && git checkout main

  git fetch origin main

  if [[ -n "$(git status --porcelain)" ]]; then
    git add .
    git commit -m "$COMMIT_MSG"
    git push origin main
    echo "Successfully pushed changes in $repo"
  else
    echo "No changes to commit in $repo"
  fi
  echo "==============================="
done

cd "$WORKDIR"
