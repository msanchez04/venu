---
timestamp: 'Fri Oct 17 2025 09:33:41 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_093341.a4c47a22.md]]'
content_id: 2b04735c90df10412b955e82b803b28e0a5cd1030185adadaddabe4b2969ffb3
---

# problem:

The error `Cannot find name 'userAccount'` is happening because, just like `db` and `client`, the `userAccount` variable needs to be accessible across all the different test steps (`t.step`). However, you are trying to assign a value to it inside the `try` block without ever having declared it in the outer scope of the main `Deno.test` function.

In your current code:

1. `db` and `client` are correctly declared with `let` at the top level of the `Deno.test` suite.
2. `userAccount` is **not** declared at that top level.
3. Therefore, when the line `userAccount = new UserAccountConcept(db);` runs, TypeScript sees you trying to assign a value to a variable that doesn't exist in that scope, and it throws an error.
