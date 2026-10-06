# Geography Canvas configuration repair

The production Geography Teach Me parent was bound to a queue that accepted only the test parent. Its builder had the same test-only parent guard. Generic requests for a Canvas document also entered the optional student-format validation path, which expects a genuine artifact format and explicit creation wording.

This package reproduces the reviewed repair without exporting a live graph or embedding credentials or production endpoint URLs. It changes Flowise database configuration, not the server runtime. Use `[skip render]` in the source commit and merge message to avoid an unnecessary server deployment.

`geography-repair-plan.mjs` is the pinned entry point. Supply the freshly read queue, production parent and builder records in memory. It checks their reviewed hashes and returns create/update payloads. The subordinate modules are pure transforms; they never fetch, publish, execute a model prediction or write a database.

The plan creates a separate production-only queue. The original shared test queue is preserved. The production queue requires the exact production parent, retains the protected Geography/session context, HMAC over the exact body and 1900 ms acceptance timeout, and rejects explicit chat-only or no-Canvas instructions before sending. Only the exact generic phrases `Canvas`, `Canvas doc` and `Canvas document` clear the optional format pair. Genuine student-selected formats keep the existing exact-current-quote, explicit creation and negation checks. Optional schema fields remain optional.

The builder accepts only the exact test and production Geography parents. The transform edits the same predicate in both `customFunctionJavascriptFunction` and `code` on `customFunctionAgentflow_validate`. Every other raw `flowData` byte is preserved, including the webhook authentication, HMAC, subject/session fences, context reads, planner, model and WordPress publication bindings.

The parent update changes only its queue node's selected tool ID and visible alias. The distinct stored tool name is `queue_canvas_build_geography_teach_me_010_v2`; the visible alias remains `queue_canvas_build_v2`, so the existing prompt does not change. Only `flowData` is submitted on parent/builder updates; analytics and other record metadata are retained.

Create the dedicated queue and use its API-assigned UUID when building the final parent payload. The default placeholder is for local review only. Read back the queue, builder and parent after applying, compare the final payload hashes and verify the original test queue and current parent analytics are unchanged. Fill `geography-release-manifest.template.json` with the actual new tool ID and readback hashes; report the final source commit in a separate release receipt to avoid a self-reference. Keep protected raw snapshots and rollback payloads outside Git. If any live baseline has changed, stop and refresh the review rather than overwriting it.

Rollback restores the exact prior parent binding and builder `flowData` from protected snapshots and leaves the new dedicated queue unbound. Neither application nor rollback belongs to these pure transforms.

Run the contract checks with Node 24:

```sh
node tests/toby-geography-canvas-builder-repair.mjs
node --test tests/toby-geography-canvas-queue-repair.mjs
```

The builder fixture is the reviewed validator function alone. The queue fixture uses the reviewed function with its endpoint replaced by a synthetic URL; all fetches and signing secrets are offline stubs. Parent fixture content is synthetic. These checks cover automatic formation, genuine formats, stale quotes, negation, publication denial, strict parents, ownership/session bounds and exact signed-body compatibility. They do not establish authenticated learner UAT or a successfully published document.
