---
timestamp: 'Fri Oct 17 2025 09:35:30 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_093530.8f3d1ed4.md]]'
content_id: dc080f0c6bb8e16dc0c842d935de8c2f9e90b1a761060b827840744810c5047b
---

# solution:

The solution is to add the `--allow-sys` flag to your `test` task in the `deno.json` file. This will grant the test runner the final permission it needs to allow the MongoDB driver to function fully.

### 1. Update your `deno.json` file

Add `--allow-sys` to your `test` task. It's also a good idea to add it to your `concepts` task, as that will also need to connect to the database when you run it.
