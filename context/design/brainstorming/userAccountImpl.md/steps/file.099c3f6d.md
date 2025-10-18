---
timestamp: 'Fri Oct 17 2025 09:17:47 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_091747.1af10fb2.md]]'
content_id: 099c3f6d76877a66bc29f5b94a97940484a4ad399a7dd56358a1a5a745b61737
---

# file: deno.json

Here is what your `deno.json` might look like with the new task added.

```json
{
  "imports": {
    "@concepts/": "./src/concepts/",
    "@utils/": "./src/utils/",
    "@std/assert": "jsr:@std/assert@^0.223.0",
    "@std/testing/": "jsr:@std/testing@^0.224.0/",
    "npm:mongodb": "npm:mongodb@^6.3.0"
  },
  "tasks": {
    "test": "deno test --allow-net --allow-env"
  }
}
```

**Explanation:**

* We've defined a task named `"test"`.
* The value of this task is the exact command Deno should run: `deno test --allow-net --allow-env`.
* When you run `deno task test`, Deno will automatically find and run all `_test.ts`, `.test.ts`, or `.spec.ts` files in your project.

3. **Run the test task from your terminal:**

```sh
deno task test
```

This simple command will now execute your `userAccount.test.ts` file (and any other test files you create) with all the correct permissions. This is the standard and recommended way to manage and run tests in a Deno project.
