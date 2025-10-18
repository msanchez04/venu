---
timestamp: 'Fri Oct 17 2025 08:53:29 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_085329.259466a2.md]]'
content_id: eb7f5691178420350bce87765a0f285698ca7f14a6d896b9912a9ae452b1cedd
---

# file: src/userAccount/UserAccountConcept.ts

```typescript
import { Collection, Db, MongoServerError } from "npm:mongodb";

// BEFORE:
// import { ID } from "../utils/types.ts";
// import { freshID } from "../utils/database.ts";

// AFTER:
import { ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// ... rest of the UserAccountConcept.ts file
```

By making these changes, you are now consistently using the import map throughout your project. This makes your imports cleaner, avoids complex relative paths like `../../../`, and makes it easier to restructure your project in the future. The `deno(no-local)` error should now be resolved.
