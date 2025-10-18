---
timestamp: 'Fri Oct 17 2025 08:44:37 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_084437.ef7f903b.md]]'
content_id: 08d6fb756ebd4c850b5da0dbd41839c08a39d352b7376682ca3d32cde71698d7
---

# problem:

The error `Unable to load a local module... deno(no-local)` arises because your code is still trying to import a local file using a relative path (like `../utils/database.ts`), but your project is configured via `deno.json` to use path aliases (like `@utils/`).

You have correctly set up your `deno.json` file to tell Deno: "Any time you see an import path that starts with `@utils/`, you should look for the file starting from the `./src/utils/` directory (relative to the `deno.json` file itself)."

The problem is that your test file (or concept file) has not yet been updated to *use* this new `@utils/` alias. It's still using the old relative path.
