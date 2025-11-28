"""
Modal serverless functions for AutoLawyer-MCP agent execution.
Deploy heavy AI workloads to Modal's GPU infrastructure.
"""
import modal

# Modal app and image setup
app = modal.App("autolawyer-mcp")
image = (
    modal.Image.debian_slim()
    .pip_install(
        "litellm==1.43.6",
        "openai",
        "python-dotenv==1.0.1",
    )
    .env({"AUTO_LAWYER_OFFLINE": "0"})
)

# Secrets: store API keys in Modal dashboard
# modal secret create openai-secret OPENAI_API_KEY=sk-...
# modal secret create modal-secret MODAL_API_KEY=...


@app.function(
    image=image,
    secrets=[
        modal.Secret.from_name("openai-secret", required=False),
        modal.Secret.from_name("modal-secret", required=False),
    ],
    timeout=300,
)
def complete_text(
    prompt: str,
    model: str = "gpt-4o",
    temperature: float = 0.2,
    max_tokens: int = 2000,
    system_prompt: str = "You are AutoLawyer-MCP's reasoning engine. Follow the user's format instructions exactly.",
):
    """
    Serverless LLM completion via Modal. Used by ModelRouter for heavy planning/review tasks.
    """
    from openai import OpenAI
    import os

    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("MODAL_API_KEY")
    if not api_key:
        raise ValueError("No API key found in Modal secrets")

    client = OpenAI(api_key=api_key)
    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ],
        model=model,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return chat_completion.choices[0].message.content


@app.function(
    image=image,
    secrets=[modal.Secret.from_name("openai-secret", required=False)],
    gpu="T4",  # Optional GPU for heavy reasoning
    timeout=600,
)
def plan_case(case_context: dict):
    """
    Serverless planning task - runs Planner on Modal GPU.
    """
    prompt = (
        "You are the Planner for AutoLawyer-MCP. "
        "Given the case context below, produce a JSON array of steps to "
        "ingest, segment, score risk, propose redlines, compare docs, and "
        "prepare executive summaries with traceability.\n"
        f"Context:\n{case_context}"
    )
    return complete_text.remote(
        prompt=prompt,
        model="gpt-4o",
        temperature=0.1,
        max_tokens=3000,
    )


@app.function(
    image=image,
    secrets=[modal.Secret.from_name("openai-secret", required=False)],
    timeout=300,
)
def review_output(artifacts: dict, task_name: str):
    """
    Serverless review task - runs Reviewer verification.
    """
    prompt = (
        f"Review the {task_name} output for AutoLawyer-MCP. "
        "Verify accuracy, completeness, and adherence to legal best practices. "
        "Return JSON: {{\"status\": \"pass\"|\"fail\", \"notes\": [str]}}\n"
        f"Artifacts:\n{artifacts}"
    )
    return complete_text.remote(
        prompt=prompt,
        model="gpt-4o-mini",
        temperature=0.2,
        max_tokens=1500,
    )


@app.local_entrypoint()
def main():
    """Test Modal functions locally."""
    test_prompt = "The easiest way to deploy a serverless GPU function in Python is "
    result = complete_text.remote(test_prompt)
    print(result)

