---
timestamp: 'Fri Oct 17 2025 09:26:44 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_092644.cd50f03f.md]]'
content_id: 3354544163162359abab4d7cd9aaa9e6521ba2b767c718042bc3c917a7157bc2
---

# file: deno.json

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
    "test": "deno test --allow-net --allow-env --allow-read",
    "concepts": "deno run --allow-net --allow-read --allow-sys --allow-env src/concept_server.ts --port 8000 --baseUrl /api"
  }
}
```

### 2. Run Your Tests Correctly

Now that your task is correctly configured, you should run it in the standard way. Deno's test runner will automatically find all files ending in `.test.ts` (or `_test.ts`).

**In your terminal, simply run:**

```sh
deno task test
```

You do not need to specify the path to the test file. The task will run all tests in your project. If you *do* want to run just one file, you can still do that:

```sh
deno task test ./tests/userAccount.test.ts
```

Deno is smart enough to combine the task's command with the file path you provide.

With the added `--allow-read` flag, your tests should now be able to read the `.env` file, connect to the database, and execute successfully.

For completeness, here is your test file again, which is correctly written and does not need any changes.
