#!/bin/bash

# Script Vars
REPO_URL="https://github.com/filippobenozzi/filippo.im.git"
APP_DIR=~/filippo.im

# Pull the latest changes from the Git repository
if [ -d "$APP_DIR" ]; then
  echo "Pulling latest changes from the repository..."
  cd "$APP_DIR"
  git pull origin main
else
  echo "Cloning repository from $REPO_URL..."
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

# Ricostruisci e avvia i container
echo "Building and starting Docker containers..."
docker compose up --build -d

# Verifica che i container siano effettivamente in esecuzione
if ! docker compose ps | grep -q "Up"; then
  echo "Docker containers failed to start. Check logs with 'docker compose logs'."
  exit 1
fi

# Elimina tutte le immagini non utilizzate
echo "Removing unused Docker images..."
docker image prune -af

# Output finale
echo "Update complete. Your Next.js app has been deployed with the latest changes."