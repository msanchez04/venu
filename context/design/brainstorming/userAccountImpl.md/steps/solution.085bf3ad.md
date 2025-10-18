---
timestamp: 'Fri Oct 17 2025 09:03:09 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_090309.ee0c91cd.md]]'
content_id: 085bf3ad63b7a6d5eff9106a21170af1c3f10e5233950801821331751000c9bd
---

# solution:

The solution is to make your `deno.json` aliases cleaner and more consistent, and then use those clean aliases in your code. We will create "bare" specifiers (like `@std/testing`) that Deno will then map to the full, versioned JSR package URL.

### 1. Update your `deno.json` to use clean aliases

Change the keys for your JSR packages to remove the `jsr:` prefix. This creates clean, reusable aliases.
