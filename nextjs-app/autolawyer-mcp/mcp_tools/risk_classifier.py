from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Dict, Iterable, List


@dataclass
class ClauseRisk:
    clause_id: str
    heading: str
    risk_score: float
    severity: str
    rationale: str
    source_document: str


DEFAULT_RISK_FACTORS = {
    "liability": ["limitation of liability", "indemnity", "cap"],
    "data": ["privacy", "data protection", "security"],
    "sla": ["service level", "uptime", "penalty"],
    "termination": ["termination", "expiry", "auto-renew"],
}


def score_clauses(clauses: Iterable[Dict], policies: Dict) -> List[Dict]:
    """
    Lightweight lexical heuristics + policy overrides to rank risk.
    """
    policies = policies or {}
    outputs: List[Dict] = []
    for clause in clauses:
        text = clause["body"].lower()
        heading = clause["heading"].lower()
        risk_factor = _infer_factor(text + " " + heading, policies)
        score = min(1.0, risk_factor / 5.0)
        severity = _score_to_severity(score)
        rationale = f"Factor weight {risk_factor:.2f} derived from matched policy keywords."
        outputs.append(
            ClauseRisk(
                clause_id=clause["clause_id"],
                heading=clause["heading"],
                risk_score=score,
                severity=severity,
                rationale=rationale,
                source_document=clause["source_document"],
            ).__dict__
        )
    return outputs


def _infer_factor(text: str, policies: Dict) -> float:
    custom = policies.get("keywords", DEFAULT_RISK_FACTORS)
    weight = 0.0
    for factor, keywords in custom.items():
        for keyword in keywords:
            if keyword.lower() in text:
                weight += 1.5 if policies.get("priority") == factor else 1.0
    return max(weight, 0.1)


def _score_to_severity(score: float) -> str:
    if score >= 0.8:
        return "critical"
    if score >= 0.5:
        return "high"
    if score >= 0.3:
        return "medium"
    return "low"


