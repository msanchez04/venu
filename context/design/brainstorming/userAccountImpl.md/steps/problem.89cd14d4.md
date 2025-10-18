---
timestamp: 'Fri Oct 17 2025 09:35:30 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_093530.8f3d1ed4.md]]'
content_id: 89cd14d45b59e36299936ecb2862552e61d600226c492fc7dd6530c4d436d357
---

# problem:

The error message `NotCapable: Requires sys access to "osRelease", run again with the --allow-sys flag` is another perfect example of Deno's security-first design.

1. When the MongoDB driver first establishes a connection to the database server, it sends along some metadata about its environment. This is standard practice for many large libraries and is used for analytics and debugging purposes (e.g., "Connection from Deno v1.42 on macOS ARM").
2. To get this information, the driver needs to ask the system about its details, specifically the "OS Release".
3. In Deno, any access to system-level information (like OS type, memory usage, etc.) is protected. It requires you to explicitly grant permission using the `--allow-sys` flag.
4. Your current `test` task has permissions for network, environment variables, and file reading (`--allow-net --allow-env --allow-read`), but it's missing the permission to access system information.
