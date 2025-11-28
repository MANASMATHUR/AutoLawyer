from __future__ import annotations

import json
import os
import re
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional

import sys

try:
    import litellm
except ImportError:  # pragma: no cover - optional dependency
    litellm = None


PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))


PROVIDER_MATRIX = (
    {
        "name": "openai",
        "model_env": "AUTOLAWYER_MODEL",
        "default_model": "gpt-4o-mini",
        "api_key_env": "OPENAI_API_KEY",
        "base_url_env": None,
        "budget_env": "OPENAI_TOKEN_BUDGET",
        "default_budget": 2_000_000,
        "priority": 0,
    },
    {
        "name": "nebius",
        "model_env": "NEBIUS_MODEL",
        "default_model": "nebius-qwen2.5-72b",
        "api_key_env": "NEBIUS_API_KEY",
        "base_url_env": "NEBIUS_BASE_URL",
        "budget_env": "NEBIUS_TOKEN_BUDGET",
        "default_budget": 1_500_000,
        "priority": 1,
    },
    {
        "name": "sambanova",
        "model_env": "SAMBA_NOVA_MODEL",
        "default_model": "sambanova-llama3.1-405b",
        "api_key_env": "SAMBA_NOVA_API_KEY",
        "base_url_env": "SAMBA_NOVA_BASE_URL",
        "budget_env": "SAMBA_NOVA_TOKEN_BUDGET",
        "default_budget": 1_000_000,
        "priority": 2,
    },
    {
        "name": "hyperbolic",
        "model_env": "HYPERBOLIC_MODEL",
        "default_model": "hyperbolic-8x7b",
        "api_key_env": "HYPERBOLIC_API_KEY",
        "base_url_env": "HYPERBOLIC_BASE_URL",
        "budget_env": "HYPERBOLIC_TOKEN_BUDGET",
        "default_budget": 750_000,
        "priority": 3,
    },
    {
        "name": "blaxel",
        "model_env": "BLAXEL_MODEL",
        "default_model": "blaxel-70b",
        "api_key_env": "BLAXEL_API_KEY",
        "base_url_env": "BLAXEL_BASE_URL",
        "budget_env": "BLAXEL_TOKEN_BUDGET",
        "default_budget": 500_000,
        "priority": 4,
    },
    {
        "name": "modal",
        "model_env": "MODAL_MODEL",
        "default_model": "modal-gpt4o",
        "api_key_env": "MODAL_API_KEY",
        "base_url_env": "MODAL_BASE_URL",
        "budget_env": "MODAL_TOKEN_BUDGET",
        "default_budget": 500_000,
        "priority": 5,
    },
)


@dataclass
class Provider:
    name: str
    model: str
    api_key: str
    base_url: Optional[str]
    token_budget: int
    priority: int
    tokens_used: int = 0


@dataclass
class RouterResult:
    output: str
    model: str
    latency_ms: float
    tokens: int
    provider: str


class ModelRouter:
    """
    Smart model routing + credit awareness using LiteLLM for provider abstraction.
    """

    def __init__(self, default_model: str = "gpt-4o-mini", budget_tokens: int = 2_000_000):
        self.policy_overrides: Dict[str, Dict] = {}
        self.providers: List[Provider] = self._load_providers(default_model)
        declared_budget = sum(provider.token_budget for provider in self.providers)
        self.budget_tokens = declared_budget or budget_tokens
        self.tokens_used = 0
        self.offline_mode = bool(os.getenv("AUTO_LAWYER_OFFLINE")) or not self.providers or litellm is None

    def register_policy(self, task_type: str, policy: Dict) -> None:
        self.policy_overrides[task_type] = policy

    def generate(
        self,
        task_type: str,
        prompt: str,
        schema_hint: Optional[str] = None,
        temperature: float = 0.2,
    ) -> RouterResult:
        policy = self.policy_overrides.get(task_type, {})
        max_tokens = policy.get("max_tokens", 2000)
        temperature = policy.get("temperature", temperature)
        preferred_provider = policy.get("provider")

        if self.tokens_used >= self.budget_tokens and not self.offline_mode:
            raise RuntimeError("Model token budget exhausted. Adjust router budget.")

        if self.offline_mode:
            output = self._offline_response(task_type, prompt, schema_hint)
            return RouterResult(
                output=output,
                model="offline-mock",
                latency_ms=5,
                tokens=len(output),
                provider="offline",
            )

        provider = self._select_provider(preferred_provider)
        model = policy.get("model", provider.model)

        # Special handling for Modal serverless execution
        if provider.name == "modal" and os.getenv("USE_MODAL_SERVERLESS") == "1":
            try:
                import sys
                modal_path = Path(__file__).resolve().parents[1] / "modal_app.py"
                if modal_path.exists():
                    import importlib.util
                    spec = importlib.util.spec_from_file_location("modal_app", modal_path)
                    modal_app = importlib.util.module_from_spec(spec)
                    spec.loader.exec_module(modal_app)
                    complete_text = modal_app.complete_text
                    start = time.time()
                    output_text = complete_text.remote(
                        prompt=self._build_prompt(prompt, schema_hint),
                        model=model,
                        temperature=temperature,
                        max_tokens=max_tokens,
                    )
                    latency_ms = (time.time() - start) * 1000
                    tokens = len(output_text.split())  # Estimate
                    provider.tokens_used += tokens
                    self.tokens_used += tokens
                    return RouterResult(
                        output=output_text,
                        model=model,
                        latency_ms=latency_ms,
                        tokens=tokens,
                        provider=provider.name,
                    )
            except (ImportError, AttributeError):
                # Fall through to LiteLLM if Modal not available
                pass

        start = time.time()
        response = litellm.completion(
            model=model,
            api_key=provider.api_key,
            api_base=provider.base_url,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are AutoLawyer-MCP's reasoning engine. "
                        "Follow the user's format instructions exactly."
                    ),
                },
                {"role": "user", "content": self._build_prompt(prompt, schema_hint)},
            ],
            temperature=temperature,
            max_tokens=max_tokens,
        )
        latency_ms = (time.time() - start) * 1000
        output_text = response["choices"][0]["message"]["content"].strip()
        tokens = response.get("usage", {}).get("total_tokens", len(output_text.split()))
        provider.tokens_used += tokens
        self.tokens_used += tokens

        return RouterResult(
            output=output_text,
            model=model,
            latency_ms=latency_ms,
            tokens=tokens,
            provider=provider.name,
        )

    def _select_provider(self, preferred_name: Optional[str]) -> Provider:
        candidates = self.providers
        if preferred_name:
            candidates = [provider for provider in candidates if provider.name == preferred_name]
            if not candidates:
                raise ValueError(f"No provider registered with name '{preferred_name}'")
        for provider in sorted(candidates, key=lambda p: p.priority):
            if provider.tokens_used < provider.token_budget:
                return provider
        raise RuntimeError("All providers exhausted their assigned token budgets.")

    def _load_providers(self, default_model: str) -> List[Provider]:
        providers: List[Provider] = []
        for config in PROVIDER_MATRIX:
            api_key = os.getenv(config["api_key_env"])
            if not api_key:
                continue
            provider = Provider(
                name=config["name"],
                model=os.getenv(config["model_env"], config["default_model"] or default_model),
                api_key=api_key,
                base_url=os.getenv(config["base_url_env"]) if config["base_url_env"] else None,
                token_budget=_env_int(config["budget_env"], config["default_budget"]),
                priority=config["priority"],
            )
            providers.append(provider)
        return providers

    @staticmethod
    def _build_prompt(prompt: str, schema_hint: Optional[str]) -> str:
        if not schema_hint:
            return prompt
        sanitized = re.sub(r"\s+", " ", schema_hint.strip())
        return f"{prompt}\n\nReturn JSON matching schema: {sanitized}"

    def _offline_response(self, task_type: str, prompt: str, schema_hint: Optional[str]) -> str:
        """
        Deterministic fallback when sponsor credits / APIs are unavailable.
        """
        if task_type == "planning":
            return json.dumps(
                [
                    {"name": "Ingest documents", "tool": "document_reader", "payload": {}},
                    {"name": "Segment clauses", "tool": "clause_segmenter", "payload": {}},
                    {"name": "Build clause index", "tool": "clause_rag", "payload": {"collection_name": "case"}},
                    {"name": "Score risk", "tool": "risk_classifier", "payload": {}},
                    {"name": "Generate redlines", "tool": "redline_generator", "payload": {"instructions": "Apply sponsor playbook"}},
                    {"name": "Compare documents", "tool": "comparator", "payload": {}},
                    {"name": "Build reporting", "tool": "report_builder", "payload": {}},
                ]
            )
        if task_type == "review":
            return json.dumps({"status": "pass", "notes": ["Offline reviewer ok"]})
        return json.dumps({"status": "unknown"})


def _env_int(name: Optional[str], default: int) -> int:
    if not name:
        return default
    try:
        return int(os.getenv(name, default))
    except ValueError:
        return default
