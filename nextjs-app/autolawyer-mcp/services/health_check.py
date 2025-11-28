"""Health check service for Next.js API."""
import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

from agent.router import ModelRouter

router = ModelRouter()
print(json.dumps({
    "status": "healthy",
    "providers_available": len(router.providers),
    "offline_mode": router.offline_mode,
}))

