---
timestamp: 'Fri Oct 17 2025 09:26:44 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_092644.cd50f03f.md]]'
content_id: 4a291c8e21fdeeecb18f848c58501bdc33bb027f4013fd2f7b441cebd4d161e0
---

# solution:

The solution is to simply add the `--allow-read` flag to your `test` task in the `deno.json` file. This will give your test runner the necessary permissions to read the `.env` file and connect to the database.

### 1. Update your `deno.json` file

Add `--allow-read` to the `test` task.
