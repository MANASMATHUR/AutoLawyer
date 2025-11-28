from __future__ import annotations

from dataclasses import dataclass


@dataclass
class ExecutionPolicies:
    """
    Central place for stop/retry/verify policies used by Planner/Worker/Reviewer.
    """

    max_retries: int = 2
    stop_on_failure: bool = False
    auto_replan: bool = True


