# Toby Canvas visual configuration

This directory contains the maintained source for the additive template diagram extension deployed on 10 October 2026. It complements the existing Canvas and specialist visual tools. The checked-in receipt records 40 independently verified configuration changes: four builders, 18 queue tools and 18 subject/mode parents. Geography has no eligible template and needs no diagram parent extension.

The transforms consume **fresh current definitions**, preserve unrelated metadata and reject missing or changed code anchors. Parent updates include the system prompt and exactly two enabled runtime API variables, `tobyDiagramCapability` and `tobyDiagramAuthoringGuidance`, in the same PUT. Existing variables, node overrides and API override status retain their values. Protected capability forwarding remains inside the authenticated queue/builder path. No global variables, prediction requests, learner records or memory are changed by this tooling.

## Checks

Use Node 24.15 or later from the repository root; no dependency installation is required for these checks:

```sh
node --test integrations/canvas-planner-v2/quality/compiler.test.mjs integrations/canvas-planner-v2/quality/visual-extension.test.mjs integrations/canvas-planner-v2/flowise-release.test.mjs
```

The source suite runs the actual checked-in Flowise runtime-variable filters and speech filter using Node's TypeScript stripping. Three cases need private deployment definitions and skip explicitly in a clean clone. To exercise all compiler/visual cases, provide `TOBY_VISUAL_CURRENT_DEFINITIONS` pointing to the private `original-definitions.json` from a guarded preparation. Legacy operator workspaces can alternatively supply `TOBY_VISUAL_CANDIDATE_BASE`. Optional `TOBY_WORDPRESS_SOURCE` adds PHP descriptor parity. Private snapshots and generated patches must never enter Git.

## Fresh-definition release

`flowise-release.mjs` provides the reviewed operator's prepare/apply/verify/rollback flow. Supply `FLOWISE_BASE_URL` as an HTTPS origin, `FLOWISE_API_KEY` through the operator environment, and `TOBY_RELEASE_OUTPUT_ROOT` as an existing private directory outside this checkout. Use a new direct child for each preparation. Preparation fetches the fixed resource inventory from the public receipt and creates files with restricted permissions; it performs GET requests only.

```sh
export TOBY_RELEASE_OUTPUT_ROOT=/absolute/private/flowise-releases
node integrations/canvas-planner-v2/flowise-release.mjs prepare /absolute/private/flowise-releases/reviewed-next
```

Review `preparation-receipt.json` and the candidate diff against its private snapshot. Run the full private-fixture suite before the separately authorized mutation:

```sh
node integrations/canvas-planner-v2/flowise-release.mjs apply /absolute/private/flowise-releases/reviewed-next
node integrations/canvas-planner-v2/flowise-release.mjs verify /absolute/private/flowise-releases/reviewed-next
```

The initial 2026-10-10 extension is already applied. Preparing it again against an extended parent deliberately rejects the existing marker. To verify or roll back that release, use its retained original private manifest; the public receipt contains hashes and IDs, not enough data to reconstruct private originals.

```sh
node integrations/canvas-planner-v2/flowise-release.mjs rollback /absolute/private/flowise-releases/reviewed-release
```

All operations validate payload hashes before API calls, preflight the complete release, recheck immediately before each PUT and independently read back the result. Rollback reverses order and restores only fields whose current values still match the reviewed candidate. Drift stops the operation; failed PUTs are not blindly retried. A parent requires its prompt and API configuration to match the same before/after state. These safeguards detect drift but do not claim transactional compare-and-swap support from Flowise.

## Authority and release boundaries

WordPress owns diagram generation flags, the reviewed catalogue/template intersection, learner/session identity, assessment state and curriculum scope. Generation defaults off in source. Active or unknown independent assessment fails closed; Homework permits blank/hint scaffolding. Combined Science needs a trusted Foundation scope, positive canonical subtopic and current strand. No target-grade or model-text inference grants authority. The seven template families have bounded automated primary-source review, without human expert signoff or exam-board endorsement; authoring guidance carries the scientific exclusions.

This integration source is separate from the running speech deployment and site-policy activation. Merging it does not apply Flowise configuration or authorize a Render deployment. The public receipt proves configuration/readback only; learner/device behavior requires separate authenticated runtime evidence. Keep API credentials, originals, patches, manifests and learner content outside the checkout.
