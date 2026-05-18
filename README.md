# PROMPT FORENSICS

**Find injection holes before attackers do.**

Static analysis + AI forensic notes for production LLM prompts. Drop a system prompt in, get back a severity-scored report across eight categories of vulnerability, with concrete remediations and an AI-written attack-chain narrative.

Live demo: _add Railway URL after deploy_

Submitted to **UOE Summer of Code 2026** under **Cybersecurity & Digital Privacy** + **Artificial Intelligence & Machine Learning**.

---

## The problem

Production LLM prompts get a code review from no one.

A retrieval-augmented support bot, an internal HR copilot, an autonomous email triager — each ships with a system prompt that is often the most security-sensitive string in the codebase. It embeds tool definitions, role policies, secrets, and untrusted-data envelopes. It is rarely linted, rarely diffed, and almost never security-reviewed.

When the bot breaks, it doesn't fail loudly. It refunds money, leaks PII, or executes an attacker-supplied shell command — and the post-mortem reads "the model was tricked".

## What PROMPT FORENSICS does

Takes a system prompt as input and runs it through two layers:

1. **Deterministic detection** — 14 hand-tuned rules across 8 vulnerability categories, executed as a pure function. Every finding has a span (start/end offset in the prompt), a severity weight, a rationale, and a concrete remediation. No model required, replayable, auditable.

2. **AI forensic note** — Claude Sonnet 4.6 reads the prompt and the findings list, then writes a senior-engineer briefing: which two findings chain together, what an end-to-end attack would look like, and the single highest-leverage remediation.

The output is a forensic report a security engineer could hand to a product team on Monday morning.

## Eight categories of vulnerability

| Category | What it catches |
| --- | --- |
| Instruction Override | "ignore previous instructions", "disregard all", "new instructions:" |
| Role Hijack | "you are now", "pretend to be", "developer/debug/jailbreak mode", "DAN mode" |
| Delimiter Injection | Unescaped `{{var}}`, `${var}`, `<% %>`, triple-backtick interpolations |
| Secret Exposure | OpenAI / Anthropic / Stripe / GitHub / AWS keys, JWTs embedded in prompts |
| Unsafe Tool | `run_shell`, `eval_code`, `transfer_funds`, `delete_user` without confirmation |
| PII Handling | SSN / payment card patterns, unscoped employee/customer record retrieval |
| Prompt Leak | "reveal the system prompt", "repeat everything above" extraction attempts |
| Indirect Injection | Fetching URLs / emails / documents and concatenating into model context |

## Demo flow

Six pre-loaded scenarios on the landing page — each is a real-world prompt archetype (banking support, HR assistant, customer chat, code-review bot, email triage, healthcare intake). Click any card to see its forensic report:

- The full prompt, with vulnerable spans color-coded by severity (hover for the rationale)
- A risk score (0–100) with band classification (safe / watch / elevated / critical)
- Severity counts across the five tiers
- Findings sorted by severity, each with rationale, remediation, and the regex evidence that matched
- An AI forensic note explaining the attack chain in plain prose
- A "regenerate ↻" button that calls Claude live for a fresh note

Everything is click-driven — no input forms in the demo path.

## Architecture

```
┌───────────────────┐                ┌────────────────────────┐
│ src/lib/          │                │ Static prerender (SSG) │
│   detectors.ts    │  pure          │ at build time          │
│   scenarios.ts    │  function ───► │ → /scan/[scenario-id]  │
│   types.ts        │  no I/O        │                        │
└───────────────────┘                └────────────────────────┘
        │
        │ runDetectors(prompt) + scoreFindings(findings)
        │
        ▼
┌────────────────────────────────┐
│ Findings: span + severity +    │
│ rationale + remediation        │
└────────────────────────────────┘
        │
        │  POST /api/scan { scenarioId }
        ▼
┌────────────────────────────────┐    ┌─────────────────────────┐
│ src/lib/claude.ts              │───►│ Claude Sonnet 4.6       │
│ (cached system prompt,         │    │ (cache_control:         │
│  thinking disabled, 600 tok)   │    │  ephemeral)             │
└────────────────────────────────┘    └─────────────────────────┘
        │
        ▼
   AI forensic note
```

- **Framework**: Next.js 16.2.6 (App Router, Turbopack)
- **UI**: React 19, Tailwind CSS 4, Framer Motion 12
- **AI**: Anthropic SDK 0.95, Claude Sonnet 4.6 with `cache_control: ephemeral` on the system prompt
- **Detection**: pure-function regex rules in `src/lib/detectors.ts` — auditable in one file
- **Hosting**: Railway

## Running locally

```bash
git clone https://github.com/beto-llanos/prompt-forensics
cd prompt-forensics
npm install
cp .env.example .env.local      # only needed for "regenerate ↻"
npm run dev
```

The pre-loaded scenarios render entirely from the cached results — no API key needed to run the demo. The Anthropic key is only consumed when the user clicks "regenerate ↻".

## Scaling story

The detection engine is a pure function over a string and a rule list. To productionize:

1. **GitHub App** — runs on every PR that touches a `prompts/` directory; comments on the diff with new findings. Same detector code, different surface.
2. **Library** — `npm i @prompt-forensics/scan` exposing `runDetectors(prompt) → Finding[]` for CI pipelines.
3. **API** — `/v1/scan` accepting any prompt, billed per scan. The cached AI summary cuts cost by ~85% on repeated scenarios.
4. **Rule packs** — add domain packs (fintech-PCI, healthcare-HIPAA, EU-AI-Act) as separate rule lists; users select packs in the UI.

The model-driven layer is intentionally thin — most of the value is in the deterministic engine, which means the marginal cost per scan is near-zero and the system stays explainable to security teams.

## Roadmap

- [ ] Upload-your-own-prompt mode (with rate limiting + scrubbing)
- [ ] Diff mode — scan two versions of a prompt and surface what changed
- [ ] SARIF export so findings flow into existing security dashboards
- [ ] Rule packs (PCI, HIPAA, EU AI Act)
- [ ] Self-hosted CLI for prompts stored in private repos

## Judging-criteria mapping

| Criterion | Where it lives |
| --- | --- |
| Technical Complexity | 14 deterministic rules with span tracking + severity weighting; cached Claude Sonnet 4.6 forensic notes; pre-rendered static reports |
| UI/UX & Product Design | Forensic-console aesthetic; color-coded severity highlights with hover-sync between findings list and prompt body; click-only navigation path |
| Scalability & Feasibility | Pure-function core ports cleanly to a GitHub App, an npm package, or a hosted API. Marginal scan cost near-zero thanks to cached SSG. |
| Presentation & Documentation | README with architecture diagram, demo path, rule list, scaling story; in-product "how it works" section |

---

Built by [beto-llanos](https://github.com/beto-llanos) for UOE Summer of Code 2026.
