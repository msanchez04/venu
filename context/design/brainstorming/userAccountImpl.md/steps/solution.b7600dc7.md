---
timestamp: 'Fri Oct 17 2025 08:58:02 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_085802.23e1b9aa.md]]'
content_id: b7600dc7861500052c85feeb6bf1ee62165a2a209f6a924d495f24d24abd572c
---

# solution:

The solution is a two-step process, identical to how you fixed the `assert` error:

1. **Add the `testing` module** from JSR as a dependency in your `deno.json` file.
2. **Update the import statement** in your test file to use the new `jsr:` specifier.

### 1. Update your `deno.json` file

Add the `jsr:@std/testing` package to your `imports` map. This tells Deno where to find the testing framework.
