---
timestamp: 'Fri Oct 17 2025 08:58:02 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_085802.23e1b9aa.md]]'
content_id: 420ce137d0fa7d7183a99c731def65e6b2a38ad904a195fa2b29388f2a6b8e39
---

# file: deno.json

```json
{
  "imports": {
    "@concepts/": "./src/concepts/",
    "@utils/": "./src/utils/",
    "@google/generative-ai": "npm:@google/generative-ai@^0.24.1",
    "mongodb": "npm:mongodb@^6.3.0",
    "jsr:@std/assert": "jsr:@std/assert@^0.223.0",
    "jsr:@std/testing": "jsr:@std/testing@^0.224.0"
  },
  "tasks": {
    "test": "deno test --allow-net --allow-env",
    "concepts": "deno run --allow-net --allow-read --allow-sys --allow-env src/concept_server.ts --port 8000 --baseUrl /api"
  }
}
```

### 2. Update the import statement in your test file

Now, modify the import statement in your test file to match the new JSR entry you just added. Notice that JSR imports typically drop the `.ts` file extension.
