# Original 2D Animation Studio — Research & Agent Kit

Research snapshot: **2026-11-10 (America/Denver)**  
Prepared for: Connor O'Dea  
Scope: YouTube-first, faceless, original 2D animated entertainment franchises with a shared AI-assisted production pipeline.

## Start here

1. Read `research_report.md` for the market evidence, channel benchmark interpretation, and recommended three-show pilot.
2. Read `format_ideas.json` for 12 scored, distinct channel opportunities. Names are provisional; conduct trademark, platform-handle, and domain clearance before launch.
3. Read `pipeline_architecture.md` for the production state machine, stack, data boundaries, quality controls, economics, and scaling model.
4. Feed `coding_agent_tasks.md` to a coding agent as the build sequence; implement one acceptance-tested milestone at a time.
5. Use `agent_prompts.md` as prompt templates. Agents must return machine-readable, source-grounded outputs for downstream parsing.
6. Read `pilot_show_bibles.json` for original visual identities, characters and story rules; `channel_settings.example.json` is a disabled, dry-run configuration with no connected accounts.
7. Validate `episode.example.json` against `episode.schema.json` using `python AnimationStudioKit/verify_kit.py`; run `python -m unittest discover -s AnimationStudioKit -p 'test_*.py' -v`. The example is fictional and does **not** contain generated audio/video files.
8. Use `benchmarks.json` for research seeding and `sources.json` for dated evidence/provenance. Re-fetch public metrics before financial or publication decisions.
9. Use `analytics_spec.md` to build a repeatable channel and episode scoring process, including Shorts-vs-longform and 2026 view-counting adjustments.

## Chosen pilot portfolio

| Lane | Original concept | Core format | Pilot test | Why |
| --- | --- | --- | --- | --- |
| Visual comedy / global | Pocket Chaos Lab | 20–65s mostly dialogue-free Shorts | 8 Shorts | Low dubbing overhead, reusable rigs, rapid gag testing |
| Cult animated comedy | Department of Minor Catastrophes | 3–6 min episodes, 30–45s clips | 2 episodes + 4 clips | Closest *business model* to Big Lez: memorable original cast and lore |
| Horror / suspense | Signal at Midnight | 4–8 min narrated episodes + teasers | 2 episodes + 4 clips | Relies more on writing/audio/backgrounds than heavy character motion |

These are independent creative franchises sharing engineering infrastructure. They should **not** share identical templates, scripts, characters, or uploads across channels.

## Crucial limitations

- The user supplied the official *Big Lez* channel, but no separate video file was available in this request. This research analyzes the linked franchise, third-party public metrics, creator context, and adjacent formats; it does not claim frame-by-frame inspection of an unseen attachment.
- YouTube and tracker statistics are snapshots and can change. Counts are historical cumulative views, not prospective 30-day views or guaranteed performance.
- Channel-level views changed definition on **2026-08-24**; Shorts views changed on **2025-03-31**. Comparisons across those dates or formats must be labeled and normalized.
- Ad revenue and artistic quality are not guaranteed by animation automation. Creative writing, voice performance, originality, and editorial judgment are core constraints.
- No competitor characters, artwork, soundtracks, dialogue, or video clips are licensed or supplied by this kit.
- This is an implementation specification and prompt package, not a deployed application or validated end-to-end rendering engine. No provider key is required to review it.

## Suggested deliverable structure for the future implementation

```text
studio/
  apps/api/                   # FastAPI/Pydantic HTTP API
  apps/studio-dashboard/      # Review and scheduling UI
  services/orchestrator/      # LangGraph graphs/checkpoints
  services/scout/             # YouTube public research collectors
  services/writer/            # Show bible, ideation, scripts
  services/audio/             # TTS, transcription, timing, lip sync
  services/art/               # Original SVG assets and rig manifests
  services/renderer/          # Remotion TS compositions
  services/quality/           # Automated checks and human approvals
  services/publisher/         # OAuth publishing, manual-release gate
  services/analytics/         # Public and owner-only measurement
  packages/contracts/         # Versioned JSON schemas
  packages/show-bibles/       # Per-franchise locked style + canon
  tests/                      # Golden renders, unit and integration tests
  infra/                      # Postgres, Redis, object store, worker deploy
```

## Quality principle

**Automate the repetitive production work; preserve original human-directed humor and storytelling.** YouTube's originality and anti-spam policies apply regardless of whether AI is used.

