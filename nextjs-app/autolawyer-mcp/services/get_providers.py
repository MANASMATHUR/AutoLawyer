"""Get providers service for Next.js API."""
import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

from agent.router import ModelRouter

router = ModelRouter()
providers = [
    {
        "name": p.name,
        "model": p.model,
        "tokens_used": p.tokens_used,
        "token_budget": p.token_budget,
        "remaining": p.token_budget - p.tokens_used,
    }
    for p in router.providers
]

print(json.dumps({
    "providers": providers,
    "offline_mode": router.offline_mode,
}))

