# AuditAI Backend

FastAPI service that runs a 6-category company audit using Anakin (data) + Claude (synthesis).

## Architecture

```
api/        → FastAPI routes (HTTP boundary)
services/   → AuditService — orchestrator
planner/    → AuditPlanner — picks extractors per request
workers/    → ExtractionWorker — parallel run, progress events
extractors/ → one file per category (legitimacy, financial, …)
analyzers/  → ScoringAnalyzer + FrameworkAnalyzer (Claude)
clients/    → anakin/ (4 ports), llm/ (Anthropic)
models/     → pydantic domain models
core/       → config + logging
```

Dependencies flow downward; each layer depends only on protocols of the layer below.
Adding a 7th audit category = new file in `extractors/` + one line in `registry.py`.

## Run

```bash
cp .env.example .env   # fill ANAKIN_API_KEY + ANTHROPIC_API_KEY
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Endpoints

- `POST /audit`        — runs pipeline, returns `AuditReport` JSON
- `POST /audit/stream` — same, streams SSE events for live UI stepper
- `GET  /health`
