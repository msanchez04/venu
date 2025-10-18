---
timestamp: 'Fri Oct 17 2025 08:58:02 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_085802.23e1b9aa.md]]'
content_id: 351a6c54f821f54899c140ead28e1f7e1cf69124235a6055ee70b93e4167e27a
---

# problem:

The error `Import "std/testing/bdd.ts" not a dependency and not in import map` is happening for the same reason the last error did. Your code is trying to import a module from the standard library using the old `std/` prefix, but your `deno.json` file doesn't have a general rule for `std/`. Instead, it has very specific rules for individual JSR packages.

You have an entry for `@std/assert`, but you're missing one for `@std/testing`.
