from __future__ import annotations

from pathlib import Path

from dotenv import load_dotenv

# Load top-level .env so downstream modules can see provider keys/quotas.
ROOT_ENV = Path(__file__).resolve().parents[1] / ".env"
if ROOT_ENV.exists():
    load_dotenv(ROOT_ENV, override=False)

