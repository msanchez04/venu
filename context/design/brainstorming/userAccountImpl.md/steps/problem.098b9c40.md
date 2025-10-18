---
timestamp: 'Fri Oct 17 2025 09:26:44 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_092644.cd50f03f.md]]'
content_id: 098b9c40d1a3ba8ad3d86e72e02f56496a7f24d1be2e39d335d010704fc3f6da
---

# problem:

The error message is very clear: `Requires read access to ".env", run again with the --allow-read flag`.

1. Your test setup function, `testDb()`, almost certainly uses a library like `dotenv` to load your database connection string from a `.env` file.
2. In order to read the `.env` file from your computer's disk, the Deno script needs permission. This permission is granted by the `--allow-read` flag.
3. Your current `test` task in `deno.json` is `deno test --allow-net --allow-env`. It has permission to access the network (`--allow-net`) and read environment variables (`--allow-env`), but it is missing the permission to **read files**.

The error occurs "uncaught" and outside of a specific test because loading the `.env` file happens at the top level of your `database.ts` module, before any of the actual tests have a chance to run.
