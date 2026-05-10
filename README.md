# AuditAI

> Pre-seed VC diligence in 3 minutes, not 4 hours.

Built on Anakin (data) + Claude (synthesis). Drop in a company URL — get six audit
scores, concrete claim-vs-evidence discrepancies, four analytical frameworks, and a
partner-ready PPTX export.

## Architecture

```
backend/  FastAPI · planner → workers → extractors → analyzers (SOLID, DI'd)
frontend/ Vite + React + TS + Tailwind · Titan design system (monochrome, pill-shape)
PRD/      Design tokens, prompts, demo deck
```

Backend layout:

```
api/        HTTP boundary
services/   AuditService — orchestrator
planner/    AuditPlanner — picks extractors per request
workers/    ExtractionWorker — parallel run, progress events
extractors/ one file per category (legitimacy, financial, …)
analyzers/  ScoringAnalyzer + FrameworkAnalyzer (Claude)
clients/    anakin/ (4 ports), llm/ (Anthropic)
models/     pydantic domain models
core/       config + logging
```

Adding a 7th audit category = new file in `extractors/` + one line in `registry.py`.

## Run

```bash
# backend
cd backend
cp .env.example .env   # fill ANAKIN_API_KEY + ANTHROPIC_API_KEY
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# frontend (separate shell)
cd frontend
npm install
npm run dev            # http://localhost:5173
```

## API

- `POST /audit`        — full pipeline → `AuditReport` JSON
- `POST /audit/stream` — same, streamed as Server-Sent Events for the live stepper
- `GET  /health`

## Design

Titan monochrome system. Pill buttons (160px), Off-White Sage cards (32px radius),
Geist + Geist Mono. No shadows, no extra colors except `#ff9900` SVG accents.
See `PRD/DESIGN.md` and `PRD/agent-prompt-guide.md`.
