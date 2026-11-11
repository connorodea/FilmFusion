# AI Coding-Agent Build Plan (Production-Ready Acceptance Criteria)

This is a **specification for future implementation**, not a claim that the platform has been deployed. Give one milestone at a time to a coding agent. After each milestone, review tests and a demonstrable artifact. Do not create hundreds of unmerged branches or drift from a canonical contract.

## Master prompt for Claude Code / Codex / other coding agent

```text
Act as staff software engineer, animation-pipeline architect and test engineer.
Build an original 2D YouTube animation production system using the files in this kit
as authoritative specifications. Do not start by overengineering a distributed studio.
Use Python 3.12+, FastAPI/Pydantic, Postgres, Redis-backed jobs, TypeScript/React
and a frame-accurate Remotion-based renderer if commercial licensing is acceptable.
Use a durable human-review-capable orchestration flow (LangGraph is preferred).

Rules:
- Read README.md, pipeline_architecture.md, episode.schema.json, agent_prompts.md,
  analytics_spec.md and the current milestone before editing code.
- Implement only the assigned milestone, including all required business logic.
- Preserve contracts, migration compatibility, deterministic behavior and security.
- Use clean interfaces/provider adapters, no copied cartoons, no unlicensed sounds,
  no voice cloning without consent, and no third-party uploads in test fixtures.
- Secrets only through approved credential setup; before API-backed app implementation,
  request the provider-key reuse/new-key decision required by the environment.
- Never log secrets. Never fabricate YouTube or owner analytics.
- Every external write/publish action requires explicit user authorization and audit.
- Add meaningful unit/integration tests and failure-path tests; target >=95% coverage
  on pure contract/domain modules and document untested media quality areas.
- Show a reproducible command and result for each acceptance criterion.
- Keep PRs small, merge sequentially after review, and stop on failed tests.

At completion output: files changed, architecture decisions, tests run/results,
sample outputs, open risks and the next single milestone. No placeholders where
the milestone requires behavior, no silent exception swallowing, no fake successes.
```

## Milestone 0 — Clean repo and reproducible environment

**Goal:** a repository that runs the same way on the founder's Mac and cloud Linux.

Requirements:

1. Set up `apps/api`, `services/orchestrator`, `services/renderer`, `packages/contracts`, `tests`, `infra` as in README.
2. Pin Python/Node/FFmpeg versions; lock dependencies; use `ruff`, `mypy`/`pyright`, `pytest`, `vitest` and TS strict mode.
3. Docker Compose for Postgres, Redis, API and one renderer worker. No cloud dependency for the first sample.
4. Include a README with one-command boot/test/render fixture, environment checks and graceful shutdown.
5. Make sure no credentials or actual copyrighted media are committed to git.

Acceptance: `docker compose up --build` reaches health checks; `make test` passes; restart preserves DB state. No paid API calls.

## Milestone 1 — Contracts, show namespace and immutable versions

1. Port `episode.schema.json` and `episode.example.json` into `packages/contracts` without changing their meaning.
2. Define Pydantic models and TS types from canonical JSON schemas; ensure tests reject unknown/invalid fields.
3. Add cross-reference checks: no missing asset/character, no duplicate IDs, contiguous frame spans, audio/action timing inside shot, correct show namespace.
4. Store immutable `episode_versions` by SHA-256; every revision invalidates downstream approvals.
5. Implement four fixture tests: good episode; missing rig; overlapping shots; unlicensed asset.

Acceptance: example validates; all corruption fixtures fail with human-readable paths; changing source produces a new version without overwriting old versions.

## Milestone 2 — Public YouTube Scout (read-only)

1. Resolve channel IDs from handles using the official YouTube Data API, then use the upload playlist/videos APIs for public items; avoid brittle HTML scraping.
2. Respect current quota buckets, rate limits, retries/backoff, and 30-day public metadata refresh/delete requirements.
3. Capture public video count, subscriber count, title, description, publication time, duration, format when available, views, likes, comments and source timestamps; tag unknown metrics explicitly.
4. Keep separate `metric_version` values for March 2025 Shorts and August 2026 channel counting changes.
5. Seed the crawler with `benchmarks.json` but distinguish fixture snapshots from live API observations.
6. Implement T0/24h/72h/7d/28d read-only collection jobs and `age_matched_outlier_score` with a minimum comparable cohort.

Acceptance: fixture tests prove no imaginary CTR/retention/RPM is populated, duplicate snapshots are idempotent, and quota exhaustion pauses gracefully. Live API testing only after credential/access confirmation.

## Milestone 3 — Show bible and rights-controlled registry

1. Create versioned shows, characters, locations, palettes, pose rigs, voice profiles and props.
2. Add ownership/license records with document link, licensor/artist, usage rights, expiry, country and reviewer decision.
3. Enforce show namespace isolation: assets from one franchise cannot be used by another without explicit import and rights check.
4. Add canon diff review and rejection of unapproved changes to character design/relationships.

Acceptance: a cross-show art reference without rights fails; approved canon remains immutable; all license changes show in audit log.

## Milestone 4 — Creative LangGraph with real editorial gates

1. Implement `scout -> concept -> bible -> beats -> script -> script_review -> shots` graph.
2. Store states/checkpoints, prompt version, model used, stage input hashes, token/time cost, evidence IDs and proposed changes.
3. Add human interrupt at greenlight, script and shot plan; `reject`, `request_changes`, `approve` are persisted typed decisions.
4. After any edit, downstream approved nodes are invalidated; automatic rewrite loops cap at three attempts.
5. External LLMs are accessed through a replaceable adapter; an offline deterministic fixture adapter allows complete tests without provider API calls.

Acceptance: a run pauses at review, survives process restart, resumes from the same version and cannot advance on rejected input.

## Milestone 5 — SVG character rig engine and action library

1. Define layer/anchor contract for one original character (body, eyes, visemes, arms, props).
2. Implement approved primitives: `hold`, `idle`, `blink`, `talk`, `glance`, `head_tilt`, `walk`, `point`, `pick_up`, `drop`, `shake`, `squash`, `jump`, `recoil`.
3. Ensure transforms are composable, clamped, time-indexed and deterministic; reject missing layers.
4. Add five golden-frame image snapshots across 24/30fps input and both orientations.
5. Draw only **original** demonstration shapes; no competitor assets or ripped animation frames.

Acceptance: same fixture produces consistent positioned poses, no frame gaps and no part-anchor jumps beyond defined thresholds.

## Milestone 6 — Audio, captions and lip sync

1. Implement provider-neutral `TTSAdapter` with Fish Audio as an optional licensed implementation and a fixture/mock backend for tests.
2. Cache outputs by exact text+voice+settings hash and store usage/rights metadata.
3. Add Deepgram or an authorized equivalent for word timing and a script-to-audio mismatch check.
4. Run Rhubarb CLI on WAV to produce viseme cues; map A–H to approved mouth poses.
5. Mix speech, music and cleared SFX; generate SRT/VTT; apply loudness/peak QC.
6. Human reviewer selects legal voice IDs and signs performance/copyright approvals.

Acceptance: fixture speech yields nonnegative monotonic word timings and visemes, no cues beyond line duration, and playable mixed audio with no clipping. Never ship a voice clone of a real person without consent.

## Milestone 7 — Render compile, preview and variants

1. Build Remotion composition from `episode.schema.json`, **not** raw LLM-generated JSX.
2. Render deterministic 1080x1920 and 1920x1080 variants, 30fps by default, SVG rigs, camera transforms, subtitle layer and final audio.
3. Preview per-shot and full timeline; render cache by episode/source hash and runtime version.
4. Fail on missing art/sound or unsupported animation action, no silent replacement.
5. Probe final MP4 via FFprobe for codec, dimensions, FPS, length and audio track.
6. Confirm any required Remotion commercial license before rendering production workloads.

Acceptance: the 60-second fixture renders with the expected duration/dimensions and audible dialogue in a controlled test environment; batch re-render does not duplicate work.

## Milestone 8 — Automated media QA and human editorial approval

1. Implement testable, reported automated checks from `pipeline_architecture.md`.
2. Generate screenshot contact sheet and waveform plus the actual playable MP4 for reviewers.
3. Detect missing frames, black frames outside intentional transitions, silent dialogue, subtitle overflow, codec mismatch, rights gaps and metadata mismatch.
4. Add editorial rubric scored by a human for original joke quality, pacing, character continuity and audience value.
5. Define P0/P1/P2 triage; P0 blocks approval and publish.

Acceptance: intentionally corrupted video, missing sound rights and wrong speaker/audio each produce the correct failure; only an approved exact immutable version moves to release queue.

## Milestone 9 — Review dashboard / task queue

1. Build a clear UI: channel switcher, episode workflow stages, video player, per-shot timeline, asset approval, audit, issue list and scheduling queue.
2. Enable diff between script/asset/episode versions and automatic invalidation of approvals.
3. Role-based access for owner, writer, editor, animator, publisher; no anonymous publish actions.
4. Safe concurrency: optimistic version checks prevent stale user approvals on changed episodes.

Acceptance: a reviewer can reject a single shot, see associated evidence, approve the corrected version and verify an audit trail.

## Milestone 10 — YouTube draft upload + manual release

1. Implement OAuth with only needed YouTube scopes; verify current upload API requirements.
2. Upload a user-approved test video as **private draft** to a controlled test channel (only after owner authorization).
3. Attach verified title, description, thumbnail, language, captions, audience classification, playlist and appropriate disclosure review.
4. Separate `UPLOAD_DRAFTED` and `RELEASED`; require a second explicit publication approval.
5. Implement idempotency and reconciliation after timeouts; do not accidentally post twice.

Acceptance: no video becomes public without explicit approval, duplicate retries do not create additional posts, and failures are recoverable.

## Milestone 11 — Analytics loop and experiments

1. Pull owner-only metrics with authorized OAuth: retention, average view duration, engaged Shorts views, impression CTR, returning viewers and revenue when available.
2. Keep public views and private metrics in typed separate records; never backfill unknown retention.
3. Version channel cohorts and preregistered tests; compare age/format matched performance.
4. Report production costs per approved minute; include human work and rights costs.
5. Create a weekly experiment brief with evidence, counterevidence, recommendation and uncertainty.

Acceptance: proper schema rejects mixed public/private metrics, computes 28d cohort comparisons, and recommends `hold` for insufficient evidence.

## Milestone 12 — Portfolio / horizontal scale

1. Add isolated project configuration and per-show quotas (compute, API spend, storage, release caps).
2. Share renderer, prompt registry and analytics code; never share protected character IP by default.
3. Add approved multilingual tracks to successful franchises if channel feature access exists.
4. Implement queue priorities and spending circuit breakers; no uncontrolled agent retry storms.
5. Create standard onboarding wizard for a new *original* show and a kill-switch for misbehaving jobs.

Acceptance: second show boots from a distinct bible, cannot use first show's restricted assets, and a simulated over-budget job stops safely. Account and content policy compliance remains mandatory.

## Release policy

Every milestone: (a) tests, (b) fixture/demo, (c) reviewer confirmation, (d) versioned release, (e) one next milestone. A report claiming 95% coverage must include command output and scope, not an invented number. The pipeline is never permission to spam YouTube, bypass platform limits, or copy an existing creator's intellectual property.

