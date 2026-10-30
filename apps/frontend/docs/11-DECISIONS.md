# 11 · Decisions

This doc records the product and architecture decisions that are settled, and for each one what is actually built. **Don't reopen a decision without writing the override here.** The originals are in `archive/DECISIONS_LOCKED.md` (locked 2026-09-13) and `archive/adr/0001-water-agents-cloud-untouched.md`.

## D1: Water keeps the Three.js factory as its main mode

| Water mode | Status | `result_kind` |
|---|---|---|
| `water-threejs`: planner → locked passes → separate generator and evaluator (`runStudioPipeline`) | **Shipped, first-class** | `three_factory` |
| `water-mesh`: third-party mesh providers via BYOK (Meshy, Tripo, fal, Rodin) | **Deferred**: not built | `glb` |

- Choosing a mode inside Water is not an engine switch.
- No skill, gate or doc may assume `water-mesh` exists until it ships.

## D2: Characters are refused on Cloud and allowed stylized-only on Water

| Engine | Rule | Built? |
|---|---|---|
| Cloud | Refuse character, humanoid, face, hair and creature prompts. We have no identity rubric, so we would lose the comparison | **Not enforced.** The refusal is in `apps/backend/src/lib/create/compile.ts`, but `apps/backend/src/routes/threeD.ts` doesn't call it |
| Water | Allowed, stylized only, with an explicit "not photoreal likeness" contract | Yes: the `character` pack |

Factories stay static (no `userData.tick`), animation included.

## D3: Pixal3D, BlueFox, TRELLIS and `trilles` are one engine

They are all the same Cloud backbone; there is no second host. The `cloud-run-pixal` skill id keeps its name. The `TRELLIS_*` env names mentioned in the original are stale: the gateway URL now comes from `app_settings` and `HYDRILLA_GPU_API_URL` ([05](05-CLOUD-GENERATION.md#step-2-image--3d-on-the-gpu-vm)).

## D4: The orchestrator is backend stages now; eve maybe later

- The pipeline is built as backend stages that use the exact stage names and the 12 frozen tool IDs. An eve wrapper could reuse the same surface later.
- **Built:** `apps/backend/src/lib/create/`, which holds contracts, compile, route, score, refine, mesh gates and thresholds.
- **Never built:** `lib/cloud/`. Cloud has no quality layer.
- **Parked:** the eve agents in `apps/frontend/agent/`.

## ADR-0001: Water agents run in-process; Cloud stays non-agent

- Water's only LLM loop is the Vercel AI SDK running inside the backend. The 12 tool IDs are wrapped as `tool()`s (`apps/backend/src/lib/water/tools/surface.ts`), and the hidden Director, Scene and QA modules sit next to the pipeline (`apps/backend/src/lib/water/agents/`).
- Cloud (`/api/3d/*`, credits, `engine = trilles`) is **not** an agent product. No Director, Scene IR or Water chat may be imported into Cloud routes; `apps/backend/src/lib/water/cloudFirewall.ts` guards this.
- Google ADK is not used.

## Rules carried over from the Create pack

These still apply to both engines wherever the gates are wired:

- Brain, hands and session are separate roles. The generator is never the evaluator, and the evaluator alone decides promotion.
- The engine is fixed from start to end; no code path switches between Cloud and Water.
- A deterministic geometry gate runs before any aesthetic or VLM score, and a VLM never overrides a hard geometry failure.
- Exactly one comparison sheet per `runId`. The JobCard holds the whole run state; chat is never job state.
- The asset class comes from the contract and is never guessed from filenames or keywords. Class profiles can only raise floors, never lower them.
- Exactly 12 tool IDs; there is no 13th.
- **Never ship:** game engines (e.g. Godot) as generators, AI Gateway, Comfy as a product runtime, Meshy owning the bake, or world/HUD/multiplayer skills.

## Adding a decision

Add a section `D<n>: <title>` with the date, the decision, the reason, and a "Built?" line that points at code. If it replaces an earlier decision, mark the old one **Superseded by D<n>** instead of deleting it.
