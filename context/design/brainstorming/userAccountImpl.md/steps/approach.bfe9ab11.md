---
timestamp: 'Fri Oct 17 2025 09:20:35 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_092035.3c565a8f.md]]'
content_id: bfe9ab11b754c5000ee55ebb7f5df4b3de8c62a6539c32dcfbab6036aed1b1cb
---

# approach: Rewriting to `Deno.test`

The `Deno.test` function is the core of Deno's built-in test runner. We can structure our tests in a clean way by:

1. Creating a single, top-level `Deno.test` that acts as a "suite" for the `UserAccountConcept`.
2. Using the test context argument (`t`) to define individual test cases with `t.step()`. Each `step` is equivalent to an `it` block in the BDD style.
3. Performing setup (connecting to the DB, cleaning collections) and teardown (closing the connection) within each step to ensure perfect test isolation. This is equivalent to having a `beforeEach` and `afterEach` for every test.

***
