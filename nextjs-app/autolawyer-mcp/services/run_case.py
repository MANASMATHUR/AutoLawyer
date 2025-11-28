"""Run case service for Next.js API."""
import json
import sys
import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

from agent.core import AgentCore
from agent.policies import ExecutionPolicies
from agent.router import ModelRouter

if __name__ == "__main__":
    # Read from stdin if no args (for better JSON handling)
    if len(sys.argv) > 1:
        case_context_json = sys.argv[1]
    else:
        case_context_json = sys.stdin.read()
    
    case_context = json.loads(case_context_json)

    router = ModelRouter(default_model=os.getenv("AUTOLAWYER_MODEL", "gpt-4o-mini"))
    policies = ExecutionPolicies()
    agent = AgentCore(router=router, policies=policies)

    try:
        result = agent.run_case(case_context)
        print(json.dumps(result, default=str))
    except Exception as e:
        print(json.dumps({"error": str(e)}, default=str), file=sys.stderr)
        sys.exit(1)

