#!/usr/bin/env bash
# Start FastAPI backend server
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

# Load .env if exists
if [ -f "$REPO_DIR/.env" ]; then
  set -a
  source "$REPO_DIR/.env"
  set +a
fi

# Activate venv if exists
if [ -d "$REPO_DIR/.venv" ]; then
  source "$REPO_DIR/.venv/bin/activate"
fi

cd autolawyer-mcp
python -m api.main

