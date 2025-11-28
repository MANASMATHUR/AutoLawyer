"""Get executive summary service for Next.js API."""
import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

if __name__ == "__main__":
    case_id = sys.argv[1] if len(sys.argv) > 1 else ""
    # TODO: Load from MongoDB or persistent storage
    print("Executive summary not found", file=sys.stderr)
    sys.exit(1)

