---
timestamp: 'Fri Oct 17 2025 08:40:22 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_084022.3326b139.md]]'
content_id: 28d761b2477d39888ba88db559e689bfc475277c555598c07df1ea753489b4af
---

# problem:

You are seeing two related errors from the Deno tooling:

1. **`deno(no-cache)`**: This is a runtime or pre-run error indicating that Deno cannot find the remote URL in its cache. This can happen if you haven't run a command yet that would download it, or if you're working offline.
2. **`deno-lint(no-import-prefix)`**: This is the more important error. The Deno linter is configured by default to discourage direct URL imports inside your code files. While Deno *can* work this way, it's considered better practice to manage all your dependencies in a central configuration file.

The core issue is that importing directly from URLs scatters your dependencies throughout your codebase, making them harder to manage and update. The recommended solution is to use an **import map** within a `deno.json` configuration file.
