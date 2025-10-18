---
timestamp: 'Fri Oct 17 2025 08:44:10 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_084410.5935a74a.md]]'
content_id: 76bf12c7e16ab247d780a46dbb18000a3a0b30dc3aab404c170afaae47e93c23
---

# question: I am getting this error: Unable to load a local module: file:///Users/milena/Desktop/6.1040/venu/venu/utils/database.ts

Please check the file path.deno(no-local)

**Resolved Dependency**

**Code**: file​:///Users/milena/Desktop/6.1040/venu/venu/utils/database.ts while my deno.json file now has: {

"imports": {

"@concepts/": "./src/concepts/",

"@utils/": "./src/utils/",

"@google/generative-ai": "npm:@google/generative-ai@^0.24.1",

"mongodb": "npm:mongodb@^6.3.0",

"jsr:@std/assert": "jsr:@std/assert@^0.223.0"

},

"tasks": {

"concepts": "deno run --allow-net --allow-read --allow-sys --allow-env src/concept\_server.ts --port 8000 --baseUrl /api"

}

}
