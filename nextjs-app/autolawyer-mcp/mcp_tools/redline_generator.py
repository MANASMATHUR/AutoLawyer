from __future__ import annotations

import difflib
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List


@dataclass
class RedlinePatch:
    clause_id: str
    patch: str
    rationale: str


def generate_patch(
    baseline: Iterable[Dict],
    clause_scores: Iterable[Dict],
    instructions: str,
) -> Dict:
    """
    Produce unified diffs at clause-level plus natural language rationale.
    """
    clause_lookup = {clause["clause_id"]: clause for clause in baseline}
    diffs: List[Dict] = []
    for score in clause_scores:
        clause = clause_lookup.get(score["clause_id"])
        if not clause:
            continue
        proposed = _apply_instruction(clause["body"], instructions)
        diff = "\n".join(
            difflib.unified_diff(
                clause["body"].splitlines(),
                proposed.splitlines(),
                fromfile="original",
                tofile="proposed",
                lineterm="",
            )
        )
        diffs.append(
            RedlinePatch(
                clause_id=clause["clause_id"],
                patch=diff,
                rationale=f"Addressed {score['severity']} risk with instruction '{instructions[:80]}'.",
            ).__dict__
        )
    return {"patches": diffs}


def _apply_instruction(text: str, instructions: str) -> str:
    """
    Naive deterministic rewrite to keep codepath offline-friendly.
    """
    if "cap" in instructions.lower():
        return text + "\n\nAdded: Liability cap set to 12 months of fees."
    if "termin" in instructions.lower():
        return text + "\n\nAdded: Termination requires 30 days written notice."
    return text + f"\n\n[{instructions}]"


