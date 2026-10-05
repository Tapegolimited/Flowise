# Opt-in Toby native Gemini request budget

This change is source implementation, not an activated Flowise or Render release. Existing OpenRouter models and native Gemini nodes with the new option disabled retain their prior generation path. No credential, live graph, prediction, service configuration or model mapping was changed during development.

## Contract

The existing Google Gemini component gains an optional budget. After LangChain/Flowise have assembled system instructions, Zep history, tool schemas/results and expanded uploads, the component snapshots the SDK's effective `GenerateContentRequest`. It sends that full request to **the same native model's** `countTokens` endpoint. The subsequent streaming/non-streaming generation receives the same snapshotted body. Every later agent iteration is checked again. A successful count is not permission to drop or rewrite required source material.

Generation proceeds only when:

`native totalTokens + actual maxOutputTokens + configured safety margin <= verified context limit`

The operator must obtain the selected native model's current input/output limits. Use a conservative context limit no greater than its published input limit; this implementation additionally reserves output within it. It does not claim byte size, generic OpenAI tokenization, or an OpenRouter request measures Gemini tokens. OpenRouter can transform tools/PDFs/provider input, so this guard does **not** cover the currently connected OpenRouter model.

Configuration is Flowise operator-owned, not browser-selected:

| Input                           | Requirement                                                         |
| ------------------------------- | ------------------------------------------------------------------- |
| `tobyContextBudgetEnabled`      | Literal `true`; default is `false`.                                 |
| `tobyContextWindowTokens`       | Explicit positive integer from verified native model limits.        |
| `maxOutputTokens`               | Explicit positive integer; the effective request value is reserved. |
| `tobyContextBudgetMarginTokens` | Non-negative integer; default `2048`.                               |
| `tobyContextBudgetTimeoutMs`    | Integer `1..3000`; default `1500`.                                  |

Do not expose these node inputs as prediction overrides. Keep existing WordPress protected-input checks and Flowise private authentication. The count is a tokenization RPC, not an additional judge/writer/generation call. There is no count retry, trimming, repair or hidden fallback. The normal generator's existing retry behaviour remains unchanged after an accepted request. Count failures block generation; they are not statements that the files were safely read.

Errors are redacted `TobyContextBudgetError` objects with `code` and `retryable`, and the same code in `message` so Flowise's generic HTTP error handler retains it:

-   `toby_context_budget_config_invalid` — invalid operator settings/request; non-retryable.
-   `toby_context_budget_exceeded` — required input plus reserve does not fit; non-retryable until source/config changes.
-   `toby_context_budget_unavailable` — native count failed/returned unusable data; retryable.
-   `toby_context_budget_timeout` — native count missed its bounded deadline; retryable.
-   `toby_context_budget_aborted` — cancelled request; non-retryable automatically.

No learner prompt, raw provider error, credential, private file URL or request body is included in these errors. Timeout/cancellation aborts the local count transport and blocks late output. A provider may still complete a tokenization request already received; it cannot start generation through this component after the rejected count.

## Deployment gate and rollout

1. Confirm the actual Render service's source repository, branch/commit, Dockerfile/build command, Node version and persistent storage before a deploy. The running API's version `3.1.4` is not SHA proof. Read-only GitHub deployment/status metadata did not establish that binding, and no Render connector was exposed in this session.
2. Build the existing `Tapegolimited/Flowise` fork from the reviewed source. Its root `Dockerfile` copies this fork and runs `pnpm build:docker` on Node 24. Its **`docker/Dockerfile` installs public npm Flowise**, so that path would not deploy this source patch. No new platform or plugin is required, but a component/server build and existing-service restart are required; the Flowise REST node API cannot install executable components.
3. Keep the budget option disabled and current public flow/model mappings unchanged. Read back `/api/v1/nodes/chatGoogleGenerativeAI`: component version `3.2` and the four fields should exist; ordinary existing flows must still work.
4. Root/operator verifies an existing native Google credential, native model availability and published limits using the authorised private preview. Two live Google credential metadata records existed, but credential validity/model support were not tested by this source task. Do not silently replace `google/gemini-3.8-flash` with another model/provider.
5. Only after those checks, bind the private Geography preview to the same supported native Gemini model with this guard enabled. Confirm first/subsequent tool calls, streaming/non-streaming, required text/PDF/image inputs, oversize rejection, timeout and cancellation using authorised development fixtures. Reject required-file launch rather than truncating or silently omitting source questions.
6. Keep public mappings unchanged until this authenticated preview passes. Rollback is disabling the option/restoring the previous model binding; it does not remove snapshots, transcript memory or recorded learning.

Ordinary **non-file** learning routes may launch through their existing preparation/config gates without this required-file-budget proof. Required-file route acceptance remains gated until the final provider request is counted on the actual deployed/native-supported runtime. This unresolved native/Render gate must not disable all foreground work or be described as covering OpenRouter.

## Local validation

```sh
pnpm --filter flowise-components build
node node_modules/jest/bin/jest.js --config packages/components/jest.config.js --runInBand packages/components/nodes/chatmodels/ChatGoogleGenerativeAI/TobyContextBudget.test.ts packages/components/nodes/chatmodels/ChatGoogleGenerativeAI/FlowiseContextBudget.test.ts
node tests/toby-native-model-budget.cjs
git diff --check
```

Validation: **50 Jest checks PASS**, **24 compiled-model checks PASS on both local Node 22.17 and Node 26.10**, full component `tsc`/`gulp` build PASS, targeted ESLint with zero warnings PASS, and `git diff --check` PASS. Tests use synthetic messages and **local mocked HTTP**, never live predictions. They exercise the installed Google SDK's real request serialization for count/generate/stream, including default mutation, system/tools/cached content, plus guard errors, reserve boundaries, elapsed timeout, cancellation, OFF parity and growing tool-result scratchpad. The standalone compiled-model test also uses the actual Flowise subclass, installed LangChain and Google SDK rather than mocking the LangChain base class.

These local tests do not prove a live native credential/model, deployed Render SHA, provider PDF counting support, learner UI handling or authenticated end-to-end route. Build/Jest environment is local Node 26; the standalone compiled-model test can use the existing local Node 22 executable. The fork's declared/deployment target is Node 24, which still needs actual release validation.

Primary contracts: [Google native token count](https://ai.google.dev/api/tokens), [Gemini tokens and model limits](https://ai.google.dev/gemini-api/docs/tokens), [Flowise compiled nodes](https://docs.flowiseai.com/contributing/building-node), [Flowise Render deployment](https://docs.flowiseai.com/configuration/deployment/render).
