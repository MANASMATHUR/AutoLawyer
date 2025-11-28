"""
FastAPI backend for AutoLawyer-MCP - bridges React frontend to Python agent core.
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

from agent.core import AgentCore
from agent.policies import ExecutionPolicies
from agent.router import ModelRouter

app = FastAPI(title="AutoLawyer-MCP API", version="1.0.0")

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response models
class CaseRequest(BaseModel):
    instructions: Optional[str] = "Apply default sponsor playbook"
    policy_json: Optional[str] = "{}"
    case_id: Optional[str] = None


class CaseResponse(BaseModel):
    case_id: str
    status: str
    clauses: List[Dict[str, Any]]
    risks: List[Dict[str, Any]]
    redlines: Dict[str, Any]
    reports: Dict[str, Any]
    logs: List[Dict[str, Any]]
    action_plan: List[Dict[str, Any]]


# In-memory case storage (replace with MongoDB in production)
cases: Dict[str, Dict] = {}


@app.get("/")
async def root():
    return {"message": "AutoLawyer-MCP API", "status": "running"}


@app.get("/health")
async def health():
    router = ModelRouter()
    return {
        "status": "healthy",
        "providers_available": len(router.providers),
        "offline_mode": router.offline_mode,
    }


@app.post("/api/cases", response_model=CaseResponse)
async def create_case(
    primary_docs: List[UploadFile] = File(...),
    secondary_docs: List[UploadFile] = File(default=[]),
    instructions: str = Form("Apply default sponsor playbook"),
    policy_json: str = Form("{}"),
):
    """
    Upload documents and start agent pipeline.
    """
    import tempfile
    import uuid

    case_id = f"case-{uuid.uuid4().hex[:8]}"

    # Save uploaded files temporarily
    primary_paths = []
    secondary_paths = []

    with tempfile.TemporaryDirectory() as tmpdir:
        for doc in primary_docs:
            path = Path(tmpdir) / doc.filename
            with open(path, "wb") as f:
                f.write(await doc.read())
            primary_paths.append({"name": doc.filename, "path": str(path)})

        for doc in secondary_docs:
            path = Path(tmpdir) / doc.filename
            with open(path, "wb") as f:
                f.write(await doc.read())
            secondary_paths.append({"name": doc.filename, "path": str(path)})

        # Parse policy
        try:
            policy = json.loads(policy_json) if policy_json else {}
        except json.JSONDecodeError as exc:
            raise HTTPException(status_code=400, detail=f"Invalid policy JSON: {exc}") from exc

        # Build case context
        case_context = {
            "case_id": case_id,
            "instructions": instructions,
            "primary_documents": primary_paths,
            "counterparty_documents": secondary_paths,
            "policies": policy,
        }

        # Initialize agent
        router = ModelRouter(default_model=os.getenv("AUTOLAWYER_MODEL", "gpt-4o-mini"))
        policies = ExecutionPolicies()
        agent = AgentCore(router=router, policies=policies)

        # Run pipeline
        try:
            result = agent.run_case(case_context)
            cases[case_id] = result

            return CaseResponse(
                case_id=case_id,
                status="completed",
                clauses=result.get("clauses", []),
                risks=result.get("risks", []),
                redlines=result.get("redlines", {}),
                reports=result.get("reports", {}),
                logs=result.get("logs", []),
                action_plan=result.get("reports", {}).get("action_plan", []),
            )
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Agent execution failed: {exc}") from exc


@app.get("/api/cases/{case_id}", response_model=CaseResponse)
async def get_case(case_id: str):
    """Retrieve case results."""
    if case_id not in cases:
        raise HTTPException(status_code=404, detail="Case not found")
    case = cases[case_id]
    return CaseResponse(
        case_id=case_id,
        status="completed",
        clauses=case.get("clauses", []),
        risks=case.get("risks", []),
        redlines=case.get("redlines", {}),
        reports=case.get("reports", {}),
        logs=case.get("logs", []),
        action_plan=case.get("reports", {}).get("action_plan", []),
    )


@app.get("/api/cases/{case_id}/download/exec-summary")
async def download_exec_summary(case_id: str):
    """Download executive summary as text file."""
    if case_id not in cases:
        raise HTTPException(status_code=404, detail="Case not found")
    case = cases[case_id]
    summary = case.get("reports", {}).get("executive_summary", {})
    text = (
        f"{summary.get('headline', 'Executive Summary')}\n\n"
        f"Critical: {summary.get('risk_counts', {}).get('critical', 0)} | "
        f"High: {summary.get('risk_counts', {}).get('high', 0)} | "
        f"Medium: {summary.get('risk_counts', {}).get('medium', 0)}\n\n"
        f"Top Issues:\n" + "\n".join(f"- {issue}" for issue in summary.get("top_issues", []))
        + f"\n\nRemediation:\n" + "\n".join(f"- {item}" for item in summary.get("remediation_plan", []))
    )
    return StreamingResponse(
        iter([text]),
        media_type="text/plain",
        headers={"Content-Disposition": f'attachment; filename="exec-summary-{case_id}.txt"'},
    )


@app.get("/api/providers")
async def list_providers():
    """List available model providers and credit status."""
    router = ModelRouter()
    return {
        "providers": [
            {
                "name": p.name,
                "model": p.model,
                "tokens_used": p.tokens_used,
                "token_budget": p.token_budget,
                "remaining": p.token_budget - p.tokens_used,
            }
            for p in router.providers
        ],
        "offline_mode": router.offline_mode,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

