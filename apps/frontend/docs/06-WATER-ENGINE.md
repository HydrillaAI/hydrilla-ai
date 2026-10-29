# 06 · Water engine

Water is the second generation engine. An LLM writes a **Three.js factory**, which is code that builds the object procedurally. A harness plans the work, generates it in passes, evaluates each pass and repairs failures. The output is code plus a scene graph, **not a GLB mesh** (a GLB can be exported server-side for checks). In public it is called **Water Agent** (`/water`).

## Request flow

```
POST /api/water/generate   (apps/backend/src/routes/codeSculpt.ts, requireAuth)
  slotGenerationBlock(user)                    ← hourly-plan window, checked first
  intakeGate({prompt, imageUrl})
  admitWaterImageUrl(imageUrl)                 ← fetches the reference (SSRF gap, 03 #2)
  planWaterCreate({prompt, imageUrl, qualityTier, skillId})   ← orchestrator/routeCreate.ts
  assertWaterByokModel(modelId)  +  resolveWaterApiKey(user, provider)
  insert jobs row (creditsUsed: 0) + JobCard
  respond ──► waitUntil( runStudioPipeline(...) )        ← harness/run.ts
client polls GET /api/water/jobs/:id
```

## Endpoints (`/api/water`, legacy alias `/api/code-sculpt`, all `requireAuth`)

| Endpoint | Purpose |
|---|---|
| `POST /generate` | Start a run |
| `GET /jobs/:jobId` | Status, factory code and result |
| `POST /jobs/:jobId/cancel` | Cancel (`apps/backend/src/lib/water/cancelRegistry.ts`) |
| `PATCH /jobs/:jobId/factory` | Save hand-edited factory code |
| `POST /jobs/:jobId/thumbnail` | Upload the browser-rendered thumbnail |
| `POST /chat` | Follow-up edit via the Director agent |
| `GET /jobs/:jobId/messages` | Chat history |
| `GET`/`PATCH /jobs/:jobId/scene` | Read or patch the scene graph |
| `GET /usage` | Token usage |

## The harness

Code: `apps/backend/src/lib/water/harness/`.

| Stage | File | What it does |
|---|---|---|
| Plan | `planner.ts` | Breaks the prompt into a part and structure plan |
| Passes | `run.ts` (`runStudioPipeline`) | Runs the locked build passes for the tier, in order |
| Generate | `generator.ts` | The LLM writes or extends the factory for the current pass |
| Evaluate | `evaluator.ts`, `structure.ts`, `interior.ts` | A separate evaluator reviews each pass; structural checks run without an LLM. **The generator and evaluator are always separate** |
| Execute and export | `factoryExecute.ts`, `specToGlb.ts` | Runs the factory server-side and exports a GLB so the mesh gate can check it |
| Visual pass | `visualPass.ts` | Renders turntables, runs `runMeshPostGate` and collects the evidence ([contracts](#contracts)) |
| Fallback | `fallbackFactory.ts` | A deterministic factory if the LLM output can't be rescued |

**Factory rule:** factories are **static**. `root.userData.tick` is banned (see the guard in `apps/backend/src/lib/codeSculptPipeline.ts`).

### Build passes and tiers

`BUILD_PASS_ORDER` and `TIER_PASS_UNLOCK` in `apps/backend/src/lib/waterSkills.ts` (the frontend mirrors this in `apps/frontend/lib/waterSkills.ts` for the progress rail):

| Tier | Passes |
|---|---|
| `fast` | blockout |
| `standard` | blockout, structural, form, material |
| `studio` | all 8: blockout, structural, form, material, surface, lighting, interaction, optimization |

### Skill packs

Skills are `object-studio`, `character`, `animation` and `game`. The rules are in `WATER_PACK_BINDINGS` (`apps/backend/src/lib/water/orchestrator/packs.ts`); runtime pack text is in `apps/backend/src/lib/water/skills/index.ts`.

- **Auto-routing:** keyword rules are checked in order, game → animation → character → object-studio. For example, "game-ready / collider / unity / LOD" routes to `game`, and "human / creature / avatar" routes to `character`.
- **Manual override:** the UI has a skill dropdown (`WaterSkillDropdown` in `apps/frontend/components/workspace/composer-parts.tsx`, used in `apps/frontend/app/workspace/page.tsx`) that defaults to Auto. When a user picks a skill, `skillId` is sent and `planWaterCreate` honours it. Some older docs say `skillId` no longer exists; that is wrong.
- `character` is **stylized only** (no photoreal likeness). See [11 · D2](11-DECISIONS.md).

## Time limits

**This is the most important number in Water.** Code: `apps/backend/src/lib/water/runtimeLimits.ts`.

| Constant | Value | Meaning |
|---|---|---|
| `FUNCTION_MAX_DURATION_S` | **60** | Must equal `maxDuration` in `apps/backend/api/index.ts` |
| `HARNESS_WALL_BUDGET_MS` | 50,000 | 60 s minus 10 s kept back for saving the result |
| `STALE_RUN_MS` | 90,000 | A `RUN` job with no progress for this long is treated as dead |

`budgetFor` in `harness/run.ts` defines per-tier budgets: fast 120 s, standard 420 s and studio 720 s (more for Cursor). **They are all clamped to 50 s**, so in production Standard and Studio usually stop early and return `partial: true` with the best code so far.

To run longer, raise `maxDuration` (up to 800 s on Vercel Pro with Fluid compute) and `FUNCTION_MAX_DURATION_S` **together**. For runs over about 13 minutes, the comments in `runtimeLimits.ts` say to move the pass loop to Vercel Workflow steps.

## Providers and keys

Code: `apps/backend/src/providers/`.

- **Connectors:** `anthropic.ts`, `openai.ts`, `google.ts`, `openrouter.ts`, `cursor.ts`, registered in `providers/index.ts`.
- **Model ids:** `provider:model`, e.g. `anthropic:claude-sonnet-5`, parsed by `parseWaterModelId` in `providers/ids.ts`; `migrateCodeModelId` maps legacy ids.
- **SDK:** the Vercel AI SDK v7 is used throughout. The `ai` and `@ai-sdk/*` versions are in `apps/backend/package.json`.

**Key resolution** (`resolveWaterApiKey` in `apps/backend/src/repository/platformApiKeys.ts`), tried in this order:
1. The user's own key, if they saved one (`user_api_keys`, encrypted).
2. The admin platform key (`platform_api_keys`, Admin → Water model keys).
3. Env: `WATER_<PROVIDER>_API_KEY`, then the plain provider key.

Water charges **0 credits** whichever source is used. That makes steps 2 and 3 a cost to us ([03 gap #7](03-SECURITY.md#known-gaps)).

**User-facing settings:**
- Save and verify keys: `/api/user/api-keys` (+`/verify`).
- List models: `/api/user/models`, `/api/user/openrouter/free-models`, `/api/user/cursor/models`.
- Model preferences: `PATCH /api/user/model-prefs`.
- The frontend stores enabled models in `localStorage` under `hydrilla.water.enabledModels` (`apps/frontend/lib/waterModels.ts`).

## Agents (in-process)

Code: `apps/backend/src/lib/water/agents/`.

| Agent | File | Role |
|---|---|---|
| Director | `director.ts` | AI SDK `ToolLoopAgent` that handles `/chat` follow-ups on an existing job ("move it left", "make it red"). It never runs generation itself |
| Scene | `scene.ts` | Scene-graph edits (IR in `apps/backend/src/lib/water/scene/ir.ts`) |
| Visual QA | `visualQa.ts` | Reviews rendered views |
| Performance QA | `performanceQa.ts` | Budget checks: triangles, draw calls |
| Experience | `experience.ts` | Camera framing and named sockets (still static, no `tick`) |

The 12 frozen tool IDs are wrapped as AI SDK `tool()`s in `apps/backend/src/lib/water/tools/surface.ts`. `apps/backend/src/lib/water/cloudFirewall.ts` makes sure none of this leaks into Cloud routes ([11 · ADR-0001](11-DECISIONS.md)).

## Contracts

These were frozen during the Create orchestration work and are implemented in `apps/backend/src/lib/create/`. They are partly wired for Water and **not wired for Cloud**.

### Tool surface: exactly 12 IDs

From `TOOL_IDS` in `apps/backend/src/lib/create/toolSurface.ts`:

| Role | Tools |
|---|---|
| brain | `prompt.compile`, `run.estimate`, `run.route` |
| hands | `image.rembg`, `job.submit`, `job.await`, `mesh.post.gate`, `mesh.bake`, `asset.render_views` |
| evaluator | `asset.score` |
| session | `run.checkpoint` |
| lab | `experiment.fanout` |

There is **no 13th ID.** New capability goes behind an existing tool as a worker. `POST /api/create/tools/:toolId` (`apps/backend/src/routes/createTools.ts`, internal secret only) exposes these and returns 501 for tools that are not built yet.

### JobCard

Types are in `apps/backend/src/lib/create/contracts.ts`, persistence in `apps/backend/src/repository/jobCards.ts`, and the tables in `apps/backend/sql/010_create_job_cards.sql`.

- The JobCard holds the **whole** state of a run. Chat is never job state.
- **Stage order:**
  - Water: compile-prompt → route-estimate → generate-3d → mesh-post → evaluate → refine-loop.
  - Cloud (defined but unused): compile-prompt → route-estimate → t2i → preprocess-ref → run-pixal → mesh-post → bake → evaluate → refine-loop.
- **Refine caps:** at most 3 per stage and 6 in total; stop when the score improves by less than 0.02 (`REFINE` in `apps/backend/src/lib/create/quality/thresholds.ts`).
- Required stages can't be skipped. A failed stage must carry a fail code. Resume starts at the first unresolved stage.
- `routes/codeSculpt.ts` creates a card with `insertJobCard`. Note that cards use `engine: "cloud" | "water"`, while `jobs.engine` stores `trilles` for Cloud.

### Evidence manifest

A result can't be promoted until it has a GLB, a gate report, turntables at exactly `[0, 90, 180, 270]` (`TURNTABLE_ANGLES`), exactly one comparison sheet per `runId`, and a score report. More evidence is required depending on the profile, reference image and bake.

The rules are in `requiredCaptures` / `checkEvidence` in `contracts.ts`; storage is `addEvidenceCapture` / `loadEvidenceManifest` in `repository/jobCards.ts` (table `evidence_captures`). The deterministic geometry gate always runs before any VLM score, and a VLM score never overrides a hard geometry failure.

## Data

Water state is stored in the `water_*` tables (`water_projects`, `water_assets`, `water_scenes`, `water_scene_nodes`, `water_scene_ops`, `water_runs`, `water_pass_reviews`, `water_messages`; see `apps/backend/sql/011_water_engine.sql` and `012_water_scene_material_op.sql`). It also uses `jobs` columns such as `factory_code`, `sculpt_spec`, `llm_*` and `result_kind = three_factory`. Repository: `apps/backend/src/repository/waterEngine.ts`.

## Parked: eve agents

`apps/frontend/agent/` holds two Vercel eve agents (`create-water`, `create-cloud`). They are **parked and not called by the product** (`apps/frontend/agent/README.md`), and would talk to the backend through `/api/create/tools`. The `apps/frontend/agent-skills/` and `apps/frontend/skills/water/SKILL.md` folders are prompt packs for coding agents, not runtime code.
