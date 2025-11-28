#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
REPO_DIR=$(cd "$ROOT_DIR/.." && pwd)

if [ -f "$REPO_DIR/.env" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$REPO_DIR/.env"
  set +a
fi

export AUTO_LAWYER_OFFLINE=${AUTO_LAWYER_OFFLINE:-1}
python "$ROOT_DIR/ui/gradio_app.py"
