---
timestamp: 'Fri Oct 17 2025 08:53:53 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_085353.b6c14679.md]]'
content_id: 3e71a27c0e8524c62fbc100da68b5ca21141593fd0b27e4e470d64fb63d51023
---

# response:

This is an excellent and very specific error that points to an important evolution in the Deno ecosystem. You're very close to the solution!

The error message `Import "std/assert/mod.ts" not a dependency and not in import map` is telling you the truth: your `deno.json` file no longer has an entry for `"std/"`. Instead, you have an entry for the new Deno package registry, JSR: `"jsr:@std/assert"`.

Let's fix this.
