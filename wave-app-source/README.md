# Complete Wave Desk source handoff

This archive contains all 191 tracked source files from the deployed Sites source commit `3c0bea5a704738795ee37d514078675240ab18fd`, version v6.1.6. It is the complete application, including app/api, lib, UI, scripts, tests, package.json, dependency lockfile and build configuration; it is not only the data collector.

Archive SHA256: `2a600c59826cca1ec54f0632ec1d910ae845c5c38064fd00ae83d75954b21a62`.

Unzip `WaveDesk_v6.1.6_FullSource.zip` into a temporary work directory, then inspect the `wave-app/` directory. The ZIP excludes Git credentials, installed dependencies and live D1 data. Seed files contain the original historical/source data needed by the app.

Do not modify the bookkeeping app, merge this handoff branch or deploy automatically. Continue the existing diagnostic task with the full App source. PR #1 changes the active collector; the archive is a dated snapshot, not a replacement for that PR. Ensure the app's bundled collector copy is reconciled when implementing a future fix.

The production runtime uses Cloudflare Workers with a D1 DB binding; local data/bootstrap may be required for integration tests. Clearly distinguish code review, unit tests, build checks and production verification.
