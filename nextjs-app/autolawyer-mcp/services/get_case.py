"""Get case service for Next.js API."""
import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

# In-memory storage (replace with MongoDB in production)
# For now, cases are stored per-run, so we return empty if not found
if __name__ == "__main__":
    case_id = sys.argv[1] if len(sys.argv) > 1 else ""
    # TODO: Load from MongoDB or persistent storage
    print(json.dumps({"error": "Case not found"}), file=sys.stderr)
    sys.exit(1)

