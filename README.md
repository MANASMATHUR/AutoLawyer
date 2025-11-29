# AutoLawyer-MCP

**AutoLawyer-MCP** is an autonomous MCP agent that ingests contracts (PDF/DOCX), extracts clause-level structure, scores and explains legal risk, proposes precise redlines, produces an executive one-pager & remediation plan, and compares multi-doc consistency — all in a modern **Next.js + Python hybrid stack** with multi-model orchestration and a Planner → Worker → Reviewer autonomy loop.

## 🏗️ Architecture (Next.js + Python)

- **Frontend + Backend (Next.js):** Full-stack Next.js app with API routes and React components
- **Agent Core (Python):** Planner/Worker/Reviewer loop with smart model router + execution policies
- **MCP Tool Layer (Python):** document ingestion, clause segmentation, clause RAG, risk scoring, redline generation, doc comparator, reporting
- **Storage:** MongoDB for cases/audit logs + ChromaDB for clause embeddings
- **Serverless (Modal):** Optional GPU-accelerated planning/review tasks via Modal functions

```
autolawyer-mcp/
├─ agent/              # core agent loop, router, policies
├─ mcp_tools/          # document_reader, clause_segmenter, clause_rag, etc.
├─ services/           # Python service scripts for Next.js API calls
├─ modal_app.py        # Modal serverless functions
├─ storage/            # MongoDB integration
├─ ui/                 # Gradio (legacy, optional)
├─ notebooks/          # evaluation + metrics notebooks
├─ samples/            # curated test contracts & ground truth
├─ scripts/            # automation helpers
├─ requirements.txt    # python deps
└─ README.md

nextjs-app/
├─ app/
│  ├─ api/             # Next.js API routes
│  │  ├─ cases/        # Case management endpoints
│  │  ├─ providers/    # Provider status
│  │  └─ health/       # Health check
│  ├─ page.tsx         # Main React page
│  └─ layout.tsx        # Root layout
├─ package.json        # Node.js deps
└─ next.config.js      # Next.js config
```

## 🚀 Quickstart

### 1. Backend Setup (Python)

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Environment Configuration


```bash
# OpenAI (default)
OPENAI_API_KEY=sk-...

# Nebius
NEBIUS_API_KEY=...
NEBIUS_BASE_URL=https://api.studio.nebius.ai/v1/

# SambaNova
SAMBA_NOVA_API_KEY=...
SAMBA_NOVA_BASE_URL=https://api.sambanova.ai/v1/

# Blaxel
BLAXEL_API_KEY=...
BLAXEL_BASE_URL=https://api.blaxel.ai/v1/

# Modal (for serverless GPU)
MODAL_API_KEY=...
USE_MODAL_SERVERLESS=1  # Set to 1 to use Modal functions

# MongoDB (optional, defaults to localhost)
MONGODB_URI=mongodb://localhost:27017/autolawyer
```

### 3. Frontend + Backend Setup (Next.js)

```bash
cd nextjs-app
npm install
npm run dev  # Starts on http://localhost:3000
```

### 4. Deploy Modal Functions (Optional)

```bash
# Install Modal CLI
pip install modal

# Deploy serverless functions
modal deploy autolawyer-mcp/modal_app.py

# Set secret in Modal dashboard:
# modal secret create openai-secret OPENAI_API_KEY=sk-...
```

## 📋 Usage

1. **Upload Contracts:** Use the Next.js UI to upload primary contracts (PDF/DOCX) and optional comparator documents
2. **Configure:** Set redline instructions and policy JSON
3. **Run Agent:** Click "Run AutoLawyer Agent" - the Planner → Worker → Reviewer loop executes automatically
4. **Review Results:** View clause risk matrix, executive summary, action plan, redlines, and audit logs
5. **Download:** Export executive summary as text file

## Winning Features

### ✅ Accuracy & Explainability
- Clause-level outputs with exact quote snippets and source document references
- Risk explanations with evidence spans
- RAG-powered clause retrieval with citations

### ✅ Autonomy
- Full Planner → Worker → Reviewer cycle with automatic re-planning on failures
- Retry policies with exponential backoff
- Self-verification via Reviewer checks

### ✅ Polished UX
- Modern Next.js UI with real-time updates
- Clause viewer with severity badges
- Diff editor for redline patches
- Downloadable executive summaries

### ✅ Traceability
- Complete audit logs with model/provider used, timestamps, prompts, and results
- MongoDB persistence for case history
- Step-by-step execution logs visible in UI

### ✅ Multi-Doc Consistency
- SOW vs MSA comparison checks
- Clause-level conflict detection
- Consistency heatmap visualization

### ✅ Smart Model Routing
- Multi-provider support (OpenAI, Nebius, SambaNova, Blaxel, Modal)
- Credit-aware token budget tracking per provider
- Automatic fallback to offline heuristics when credits exhausted
- Modal serverless GPU acceleration for heavy tasks

### ✅ Evaluation
- Notebooks in `notebooks/` for metrics and benchmarking
- Sample contracts in `samples/` with ground truth annotations
- Measurable metrics: clause segmentation F1, risk precision/recall, comparator accuracy

### ✅ Security & Privacy
- Local processing option (`AUTO_LAWYER_OFFLINE=1`)
- MongoDB for secure case storage
- Planned redaction mode for PII masking

## 🔧 Development

### Run Next.js Dev Server
```bash
cd nextjs-app
npm run dev
```

### Run Tests
```bash
python -m pytest autolawyer-mcp/tests/
```

### Run Evaluation Notebooks
```bash
jupyter notebook autolawyer-mcp/notebooks/
```

### Deploy to Production
- **Next.js:** Deploy to Vercel (recommended) or any Node.js hosting
- **Python Services:** Deploy agent core to Railway/Render/Fly.io or run locally
- **Modal:** Already serverless, just `modal deploy`

## 📝 Notes

- **MCP Compliance:** The agent core maintains MCP (Model Context Protocol) architecture with tool-based execution
- **Hybrid Stack:** Next.js full-stack for modern web, Python backend for AI/ML - best of both worlds
- **Modal Integration:** Set `USE_MODAL_SERVERLESS=1` to offload heavy planning/review to Modal's GPU infrastructure
- **MongoDB:** Optional but recommended for production case persistence and audit trails


