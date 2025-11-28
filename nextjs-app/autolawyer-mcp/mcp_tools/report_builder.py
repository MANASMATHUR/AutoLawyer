from __future__ import annotations

import datetime as dt
from dataclasses import dataclass
from typing import Dict, Iterable, List


@dataclass
class ExecutiveSummary:
    headline: str
    risk_counts: Dict[str, int]
    top_issues: List[str]
    remediation_plan: List[str]


def build_report(
    risks: Iterable[Dict],
    redlines: Dict,
    comparisons: Iterable[Dict],
    tasks: Iterable[Dict],
) -> Dict:
    summary = _build_summary(risks, redlines, comparisons)
    action_plan = _build_action_plan(tasks, risks)
    return {
        "executive_summary": summary.__dict__,
        "action_plan": action_plan,
        "timestamp": dt.datetime.utcnow().isoformat() + "Z",
    }


def _build_summary(risks, redlines, comparisons) -> ExecutiveSummary:
    counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    top_issues: List[str] = []
    for risk in risks:
        counts[risk["severity"]] = counts.get(risk["severity"], 0) + 1
        if risk["severity"] in {"critical", "high"}:
            top_issues.append(f"{risk['heading']} → {risk['severity']} risk")

    remediation = [
        "Finalize redline patches and export DOCX/PDF for counsel sign-off.",
        "Run comparator across SOW/MSA set to ensure consistency.",
        "Log final decisioning in audit ledger before sending to counterparty.",
    ]
    if comparisons:
        remediation.insert(0, "Resolve cross-document inconsistencies found by comparator.")

    headline = (
        f"Detected {counts['critical']} critical / {counts['high']} high risks. "
        "Redlines ready for review."
    )
    return ExecutiveSummary(
        headline=headline,
        risk_counts=counts,
        top_issues=top_issues[:5],
        remediation_plan=remediation,
    )


def _build_action_plan(tasks: Iterable[Dict], risks: Iterable[Dict]) -> List[Dict]:
    activity = []
    for task in tasks:
        activity.append(
            {
                "name": task["name"],
                "status": task["status"],
                "tool": task["tool"],
                "notes": task.get("error") or task.get("result", {}) if task.get("status") != "failed" else task.get("error"),
            }
        )
    activity.append({"name": "Risk coverage", "status": "info", "tool": "risk_classifier", "notes": f"{len(list(risks))} clauses scored"})
    return activity


