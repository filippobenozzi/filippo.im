#!/bin/bash

set -e

REPO_URL="https://github.com/filippobenozzi/filippo.im.git"
APP_DIR=~/filippo.im

if [ -d "$APP_DIR" ]; then
  echo "Pulling latest changes from the repository..."
  cd "$APP_DIR"
  git pull origin main
else
  echo "Cloning repository from $REPO_URL..."
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

echo "Installing dependencies with Bun..."
bun install

echo "Building Astro site..."
bun run build

echo "Update complete. Static files are in dist/."
