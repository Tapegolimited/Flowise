# Opt-in Toby provider chat identity

Prepared Toby v2 keeps two different owners: WordPress's canonical session key identifies its owned conversation and Zep memory; Flowise's authenticated response establishes the upstream `chatId` recorded by WordPress's existing C19 binding.

Flowise's legacy first-chat expression prefers `overrideConfig.sessionId` when `chatId` is absent. That is legitimate upstream behavior but couples both values. Do not remove the canonical memory override or substitute an untrusted browser chat UUID to obtain separation.

## Contract

-   `overrideConfig.ttIndependentChatId === true` opts in. Other types, false and absence preserve legacy behavior.
-   With no supplied `chatId`, the provider generates a UUID and memoizes it on the request. The streaming controller and buffered/queued builder call the same helper, so one request cannot mint two different upstream identities.
-   A supplied durable `chatId` always wins. Existing bindings equal to the canonical session remain valid on resume; there is no row rewrite or transcript migration.
-   `overrideConfig.sessionId` and `getMemorySessionId()` are unchanged. Zep and agent tool memory continue to use the canonical owned session key.
-   WordPress enables the flag only after it validates an accepted `TobyLearningHandoff@2.0` snapshot and reconstructs protected overrides. The browser/model does not select it. Older Entry, Help and background callers omit the flag.
-   WordPress still strips provisional first-chat IDs and persists only a real identity from an authenticated successful provider response. No new memory owner, allocation factory or database schema is introduced.

## Local checks

```sh
node node_modules/jest/bin/jest.js --config packages/server/jest.config.js --runInBand packages/server/src/utils/predictionChatIdentity.test.ts packages/server/src/utils/predictionChatIdentity.integration.test.ts
node node_modules/typescript/bin/tsc -p packages/server/tsconfig.json --noEmit
node node_modules/eslint/bin/eslint.js packages/server/src/utils/predictionChatIdentity.ts packages/server/src/utils/predictionChatIdentity.test.ts packages/server/src/utils/predictionChatIdentity.integration.test.ts packages/server/src/controllers/predictions/index.ts packages/server/src/utils/buildChatflow.ts
git diff --check
```

The actual streaming/buffered controller is exercised with mocked database/model services. Local results: **20 tests pass**, server no-emit type check passes, focused lint and diff check pass on Node 26.10. The server also compiles runtime JavaScript with `--declaration false`, and its compiled helper proves one generated identity and an unchanged memory key. Local shared dependency symlinks cause pre-existing portable-declaration TS2742 errors during ordinary declaration emission; no router annotations, dependency changes or build-setting changes are included to mask that local limitation. Clean Node 24 CI/Docker build is required before release.

The native model and request-budget component source is unchanged. Its existing **50 Jest + 24 compiled LangChain/Google SDK checks** pass against identical component source; these checks use local mocked HTTP only.

Corresponding WordPress validation uses `tests/unified-toby-prepared-gateway.php` (**69 checks**), `tests/unified-toby-prepared-mount.php` (**73 checks**), and the full offline runner (**82 commands, zero failures**). It covers protected browser override rejection, canonical memory preservation, Help/legacy exclusion, real-response binding and old canonical-equal resume.

## Deployment and rollback

1. Review and deploy this source through the existing Flowise fork/Render Docker path; retain environment, disk, model and graph configuration unchanged. Verify a clean Node 24 build before deployment.
2. Deploy the reviewed WordPress flag injection afterward. An old provider ignores the unknown opt-in and retains old identity behavior, so do not claim separation until the provider source is deployed.
3. Through the owned private preview, launch a genuinely new prepared session. Verify the response-derived binding differs from the canonical session, while the response/memory `sessionId` and protected variables still identify the canonical conversation. Resume it and verify the same upstream ID and Zep continuity; also resume an existing canonical-equal binding.
4. Test one buffered and one streaming path, confirm normal C19 first-send/retry fences, and read back the deployed source SHA. Local tests are not proof of authenticated preview behavior.
5. Rollback omits the WordPress flag or restores the previous provider source. Keep real recorded bindings, Zep memory, snapshots and learning evidence; do not rewrite IDs or restore an unsafe competing writer.
