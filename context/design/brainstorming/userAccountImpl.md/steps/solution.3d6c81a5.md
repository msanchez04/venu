---
timestamp: 'Fri Oct 17 2025 08:44:37 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_084437.ef7f903b.md]]'
content_id: 3d6c81a5c4e46586469ec94dff30067be26164f25a6847ce4083c621c5468206
---

# solution:

The fix is to update the import statements in your TypeScript files to use the aliases you defined in your `deno.json` import map. Deno will then use the map to resolve the alias to the correct file path.

### 1. Update the `import` statement in your test file

You need to find the line that imports `getDb` and change it from a relative path to your new alias.
