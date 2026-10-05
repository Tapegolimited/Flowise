# Server-bound Toby source files

## Ownership and native transport

WordPress validates the owned committed source, accepted snapshot and exact source
hash before injecting the existing top-level `uploads` value. Only that server
path sets the strict Boolean `overrideConfig.ttBoundSourceUploads`. The browser
cannot opt into this path through the protected WordPress prediction gateway.
The paired WordPress change is `1cb82e8e1e973ebe557c5dd1dbc046b7840d2495`.

The two supported source packs are `marked-test-result.txt` and
`learning-material-and-mcq.txt`: one UTF-8 text/plain `file:full` data URL,
beginning `TOBY SOURCE PACK\n`, at most 196608 decoded bytes. Invalid bytes, NUL,
incorrect names/types, duplicate sources or non-canonical base64 fail before the
model call. Source content remains learning evidence, not agent instructions.

Inside the existing `executeFlow` upload phase, the flagged source uses the
existing storage quota check, `addArrayFilesToStorage`, and native File loader.
Storage is scoped to the actual provider `chatId`, not the canonical Tutor Today
session ID used by Zep. The loader must return byte-exact readable text; it is
passed in the ordinary `<doc>` input before the learner question. Message history
stores only native `stored-file:full` metadata and reads the file through the
existing history loader. It does not store base64 source data in message metadata.

Native filenames include the SHA-256 of the exact bytes. Repeated predictions
for one source retain the same artifact name. Another source version in the same
provider chat cannot overwrite an earlier version's attachment/history. The
WordPress helper injects the required file on every governed prediction; the
native history path also retains readable content for subsequent recall.

Unflagged uploads, ordinary native full-file/PDF APIs, Help, legacy chat identity,
and existing canonical Zep memory behavior are unchanged. No source URLs, schema
changes, new storage platform or model changes are introduced.

## Offline checks

Use the repository's pinned Node 24 runtime and installed dependencies:

```sh
node node_modules/typescript/bin/tsc -p packages/server/tsconfig.json --noEmit
node node_modules/eslint/bin/eslint.js packages/server/src/utils/tobyBoundSourceFile.ts packages/server/src/utils/tobyBoundSourceFile.test.ts packages/server/src/utils/buildChatflow.ts
node node_modules/jest/bin/jest.js --config packages/server/jest.config.js --runInBand --runTestsByPath packages/server/src/utils/tobyBoundSourceFile.test.ts packages/server/src/utils/predictionChatIdentity.test.ts packages/server/src/utils/predictionChatIdentity.integration.test.ts
node node_modules/typescript/bin/tsc -p packages/server/tsconfig.json --declaration false
node packages/server/test-toby-bound-source-native.cjs
git diff --check
```

The focused Jest suites pass 48 checks. The native fixture passes 43 checks using
the actual compiled `executeFlow`, native local storage, File loader and history
reader. Its only replacements are offline database persistence, telemetry and
the ending model node. It verifies exact accented/emoji UTF-8 model input,
provider/canonical separation, one-file first use and resume, history readback,
same-byte retry, immutable changed-byte versions, foreign-provider exclusion,
and mixed/unflagged full-file compatibility. Together the fixtures check the exact
196608-byte boundary, BOM rejection, CRLF/trailing whitespace preservation, and
native quota/storage/loader/changed-readback failures stopping before any model
or message publication, without an encoded-text fallback. It makes zero model calls and zero live
database writes. Test fixture files are outside the production TypeScript source.

## Release and remaining runtime proof

Deploy the Flowise source change before the paired WordPress server opt-in. Keep
the required-file route switches off until the release owner verifies an
authenticated owned first-use and resume prediction with the actual installed
model and storage backend. Confirm that the learner-facing answer uses the file
questions/answers, the stored message has native metadata, and resumed history
can reload the same exact source. Offline source/loader tests are not that
authenticated runtime evidence. The existing file/model context-budget guards
remain authoritative. Rollback disables the file route switches and restores
the previous source mappings; preserve committed history and artifacts.
