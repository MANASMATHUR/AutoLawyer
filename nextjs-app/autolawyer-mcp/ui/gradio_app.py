from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Any, List

import gradio as gr

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

from agent.core import AgentCore
from agent.policies import ExecutionPolicies
from agent.router import ModelRouter


def _files_to_payload(files: List[Any]) -> List[dict]:
    payload = []
    for file in files or []:
        payload.append({"name": Path(file.name).name, "path": file.name})
    return payload


def run_pipeline(primary_docs, secondary_docs, instructions, policy_text):
    policy = {}
    if policy_text:
        try:
            policy = json.loads(policy_text)
        except json.JSONDecodeError as exc:
            raise gr.Error(f"Policy JSON invalid: {exc}")  # noqa: TRY003

    case_context = {
        "case_id": "case-" + os.urandom(4).hex(),
        "instructions": instructions or "Apply default sponsor playbook",
        "primary_documents": _files_to_payload(primary_docs),
        "counterparty_documents": _files_to_payload(secondary_docs),
        "policies": policy,
    }

    router = ModelRouter(default_model=os.getenv("AUTOLAWYER_MODEL", "gpt-4o-mini"))
    policies = ExecutionPolicies()
    agent = AgentCore(router=router, policies=policies)
    result = agent.run_case(case_context)

    clauses = result.get("risks", [])
    clause_table = [
        {
            "clause": clause["heading"],
            "severity": clause["severity"],
            "score": round(clause["risk_score"], 2),
            "doc": clause["source_document"],
        }
        for clause in clauses
    ]

    report = result.get("reports", {})
    exec_summary = report.get("executive_summary", {})
    summary_text = (
        f"{exec_summary.get('headline','')}\n\n"
        f"Critical: {exec_summary.get('risk_counts',{}).get('critical',0)} | "
        f"High: {exec_summary.get('risk_counts',{}).get('high',0)} | "
        f"Medium: {exec_summary.get('risk_counts',{}).get('medium',0)}"
        "\n\nTop Issues:\n- " + "\n- ".join(exec_summary.get("top_issues", []) or ["None"])
        + "\n\nRemediation:\n- " + "\n- ".join(exec_summary.get("remediation_plan", []))
    )

    action_plan = "\n".join(
        f"[{item['status']}] {item['name']} ({item['tool']}): {item['notes']}"
        for item in report.get("action_plan", [])
    )

    redlines = result.get("redlines", {}).get("patches", [])
    redline_text = "\n\n".join(
        f"{patch['clause_id']}\n{patch['patch']}\n{patch['rationale']}" for patch in redlines
    )

    logs = result.get("logs", [])
    log_text = "\n".join(
        f"{log['timestamp']}: {log['role']}::{log['task']} ({log['model']})"
        for log in logs
    )

    return clause_table, summary_text, action_plan, redline_text, log_text


with gr.Blocks(title="AutoLawyer-MCP", theme="Base") as demo:
    gr.Markdown(
        "# AutoLawyer-MCP\n"
        "Upload contracts, auto-segment clauses, score risk, propose redlines, "
        "and download executive summaries with full traceability."
    )
    with gr.Row():
        primary = gr.File(label="Primary contracts", file_count="multiple", file_types=[".pdf", ".docx", ".txt"])
        secondary = gr.File(
            label="Counterparty / Comparator docs",
            file_count="multiple",
            file_types=[".pdf", ".docx", ".txt"],
        )
    instructions = gr.Textbox(label="Redline instructions", lines=3, value="Tighten liability + privacy terms.")
    policies = gr.Textbox(label="Policy JSON", lines=4, placeholder='{"keywords": {"liability": ["cap"]}}')
    run_btn = gr.Button("Run AutoLawyer Agent", variant="primary")

    clause_view = gr.Dataframe(
        headers=["clause", "severity", "score", "doc"],
        datatype=["str", "str", "number", "str"],
        label="Clause Risk Matrix",
    )
    summary_panel = gr.Textbox(label="Executive Summary", lines=10)
    action_panel = gr.Textbox(label="Action Plan & Logs", lines=8)
    redline_panel = gr.Textbox(label="Redline Patches", lines=10)
    audit_panel = gr.Textbox(label="Audit Trace", lines=8)

    run_btn.click(
        run_pipeline,
        inputs=[primary, secondary, instructions, policies],
        outputs=[clause_view, summary_panel, action_panel, redline_panel, audit_panel],
    )


if __name__ == "__main__":
    demo.launch()

