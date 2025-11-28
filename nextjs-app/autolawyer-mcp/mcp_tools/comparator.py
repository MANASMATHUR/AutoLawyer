from __future__ import annotations

import difflib
from typing import Dict, Iterable, List


def compare_documents(primary: Iterable[Dict], secondary: Iterable[Dict]) -> List[Dict]:
    """
    Compare clause bodies across doc sets to flag inconsistencies.
    """
    secondary_lookup = {doc["name"]: doc for doc in secondary}
    findings: List[Dict] = []
    for doc in primary:
        counter = secondary_lookup.get(doc["name"])
        if not counter:
            continue
        diff = difflib.ndiff(doc["content"].splitlines(), counter["content"].splitlines())
        delta = [line for line in diff if line.startswith(("+", "-"))]
        if not delta:
            continue
        findings.append(
            {
                "document": doc["name"],
                "issues": len(delta),
                "diff_preview": delta[:40],
            }
        )
    return findings


