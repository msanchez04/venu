---
timestamp: 'Fri Oct 17 2025 09:35:30 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_093530.8f3d1ed4.md]]'
content_id: 3118c22077974016960589f9dc19e4640951ac32a0665361e026eca8db36ed88
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
    "test": "deno test --allow-net --allow-env --allow-read --allow-sys",
    "concepts": "deno run --allow-net --allow-read --allow-sys --allow-env src/concept_server.ts --port 8000 --baseUrl /api"
  }
}
```

### 2. Run Your Tests

Now, with the fully configured task, run your tests from the terminal.

```sh
deno task test
```

With this final permission granted, the MongoDB driver will be able to gather its required metadata, establish the connection successfully, and your tests should now pass without any permission-related errors.

For completeness, here is the final version of your test file, which is correctly written and does not require any more changes.
