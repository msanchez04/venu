---
timestamp: 'Fri Oct 17 2025 08:53:53 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_085353.b6c14679.md]]'
content_id: 620371ba9e9f9b2b25dc263b46dc33e33336e7649803c674f0ecc27ced259db7
---

# problem:

There is a mismatch between how you are importing the standard library's `assert` module in your code and how it is defined in your `deno.json` import map.

* **Your Code is trying to import:** `std/assert/mod.ts`. This relies on an import map entry like `"std/": "https://deno.land/std@..."`.
* **Your `deno.json` defines the import as:** `"jsr:@std/assert": "jsr:@std/assert@^0.223.0"`. This uses the new **JSR (JavaScript Registry)**, which is the modern, preferred way to handle standard Deno packages.
