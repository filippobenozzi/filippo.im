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

echo "Building and starting Docker containers..."
# Fresh CACHEBUST each run forces the image build (and the CouchDB log sync) to
# re-run even when `git pull` brought no changes, so new Obsidian notes publish.
CACHEBUST=$(date +%s) docker compose up --build -d

if ! docker compose ps | grep -q "Up"; then
  echo "Docker containers failed to start. Check logs with 'docker compose logs'."
  exit 1
fi

echo "Removing unused Docker images..."
docker image prune -af
docker builder prune -f

echo "Update complete. Your app has been deployed with the latest changes."
