---
timestamp: 'Fri Oct 17 2025 08:40:22 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_084022.3326b139.md]]'
content_id: 92c84deae0b8ac1f4443d07cb3317feea1ed08533a3e0c6afb152c7bb558e469
---

# file: deno.json

```json
{
  "tasks": {
    "test": "deno test --allow-net --allow-env"
  },
  "importMap": {
    "imports": {
      "npm:mongodb": "npm:mongodb@^6.5.0",
      "std/": "https://deno.land/std@0.204.0/"
    }
  }
}
```

**What this file does:**

* **`tasks`**: We've created a shortcut named `test`. Now, instead of typing `deno test --allow-net --allow-env ...`, you can simply run `deno task test`.
* **`importMap`**: This is the crucial part. It tells Deno that whenever it sees an import starting with `npm:mongodb`, it should resolve it to the specific version of the MongoDB driver. Whenever it sees an import starting with `std/`, it should replace it with the base URL for the Deno standard library.

### 2. Update Your Test File Imports

Now, go back to your test file and change the import statements to use the clean aliases you just defined in `deno.json`.
