---
timestamp: 'Fri Oct 17 2025 09:03:09 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_090309.ee0c91cd.md]]'
content_id: 197b79e7e82e62d339ab71d24f5c9c4985daf6a284d5fe85eb47c648f270b1c2
---

# problem:

The core issue is a misunderstanding of what the `deno.json` `imports` map does. You've correctly added the JSR packages to the file, but you're not using the map correctly in your code.

1. **`deno-lint(no-import-prefix)`**: This is the most important error. Your linter is telling you: "The whole point of an import map is to avoid writing `jsr:` or `npm:` or `https:` prefixes directly in your code files."
2. **`deno(not-installed-jsr)`**: This happens because your code is importing `"jsr:@std/testing/bdd"`. Deno looks in your `imports` map for a key that exactly matches this string, but it can't find one. Your key is `"jsr:@std/testing"`, which does **not** match `"jsr:@std/testing/bdd"`.

You've created an alias for the *package*, but you should create a cleaner, bare alias that acts like a *path*.
