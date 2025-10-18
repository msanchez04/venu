---
timestamp: 'Fri Oct 17 2025 09:03:09 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_090309.ee0c91cd.md]]'
content_id: 91138563d381878045d21ac92c4e2e7df5147dcf0d61c3b5a95cc18001f94281
---

# file: deno.json

```json
{
  "imports": {
    "@concepts/": "./src/concepts/",
    "@utils/": "./src/utils/",
    "@google/generative-ai": "npm:@google/generative-ai@^0.24.1",
    "mongodb": "npm:mongodb@^6.3.0",

    // BEFORE:
    // "jsr:@std/assert": "jsr:@std/assert@^0.223.0",
    // "jsr:@std/testing": "jsr:@std/testing@^0.224.0"

    // AFTER (clean, bare specifiers):
    "@std/assert": "jsr:@std/assert@^0.223.0",
    "@std/testing/": "jsr:@std/testing@^0.224.0/"
  },
  "tasks": {
    "test": "deno test --allow-net --allow-env",
    "concepts": "deno run --allow-net --allow-read --allow-sys --allow-env src/concept_server.ts --port 8000 --baseUrl /api"
  }
}
```

**Key Changes:**

* `"@std/assert"`: This now maps the clean alias to the JSR package.
* `"@std/testing/"`: The trailing slash is important! It tells Deno that this is a path mapping. Any import starting with `@std/testing/` will be correctly resolved.

### 2. Update your test file to use the new clean aliases

Now, modify your test file's import statements to use these new, clean aliases. All the `jsr:` prefixes will be gone from your code, which is exactly what the linter wants.
